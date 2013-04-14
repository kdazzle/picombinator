$(function() {
    $().ajaxError(function(event, jqxhr, settings, exception) {
        console.log("You had an error!");
        console.log(exception);
    });
    
    var droppableAnimate = function(target, isOver) {
        var originalHeight = 135;
        if (isOver === true) {
            var newHeight = originalHeight + 20;
        } else {
            var newHeight = originalHeight;
        }
        
        $(target).animate({height: newHeight});
    };
    
    var dropSuccessAction = function(target, dragged) {
        dragged.animate({height : 135 / 2});
        dragged.animate({height : 135});
        getCombinedImageFromServer(target, dragged);
    };
    
    var getCombinedImageFromServer = function(image1, image2) {
        var request = $.ajax({
            type: "POST",
            url: "/",
            data: {
                image1: $(image1).attr("src").split(",")[1],
                image2: $(image2).attr("src").split(",")[1]
            },
            success: function (data) {
                console.log("Success!");
                var imageStr = $.parseJSON(data).image;
                new SourceImage("data:image/jpeg;base64," + imageStr);
            },
            error: function (data) {
                console.log("Failure!");
                console.log(data);
            },
            enctype: "multipart/form-data",
        });
    };
    
    function handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        var files = evt.dataTransfer.files; // FileList object.
        for (var i = 0, f; f = files[i]; i++) {
            createImageFromFile(f);
        }
    }
      
    var createImageFromFile = function(file) {
        console.log(file);
        var reader = new FileReader();
        reader.onload = (function(theFile) {
            return function(e) {
                new SourceImage(e.target.result);
            };
        })(file);
        
        reader.readAsDataURL(file);
    };

    function handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }

    // Setup the dnd listeners.
    var dropZone = document.getElementById('drop_zone');
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);
    
    function SourceImage(imgSrc) {
        if (!(this instanceof SourceImage)) {
            return new SourceImage(imgSrc)
        }
        
        this.image = this.render(imgSrc);
        this.setDraggable(this.image);
        this.setDroppable(this.image);
        this.setDblClick(this.image);
        
        return this;
    };
    
    SourceImage.prototype = {
        constructor: SourceImage,
        
        setDraggable: function(imageElem) {
            $(imageElem).draggable({stack: ".sourceImg"});
        },
        
        setDroppable: function(element) {
            $(element).droppable({ 
                accept: ".sourceImg",
                
                over: function(event, ui) {
                    droppableAnimate(event.target, true);
                },
                
                out: function(event, ui) {
                    droppableAnimate(event.target, false);
                },
                
                drop: function(event, ui) {
                    dropSuccessAction(event.target, ui.draggable);
                }
            });
        },
        
        setDblClick: function(element) {
            $(element).dblclick(function(e) {
                $(e.target).addClass("large");
            });
        },
        
        render: function(imageSrc) {
            var newImg = $("<img />")
                .attr({src: imageSrc})
                .addClass("sourceImg");
            
            var imgLoadContainer = $("<div />")
                .addClass("imageLoad");
                
            imgLoadContainer.append(newImg);
            
            var container = $("#imageContainer").append(imgLoadContainer);
            
            var imgHeight = newImg.height();
            var imgWidth = newImg.width();
            imgLoadContainer.height(imgHeight).width(imgWidth);
            
            return newImg;
        },
        
        helloWorld: function() {
            console.log("Just made a function prototype!");
        }
    };
});