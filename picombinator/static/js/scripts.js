$(function() {
    var defaultHeight = 135;
    var defaultLargeHeight = 500;
    var droppableAnimate = function(target, isOver) {
        if (isOver === true) {
            var newHeight = defaultHeight + 20;
        } else {
            var newHeight = defaultHeight;
        }
        
        $(target).animate({height: newHeight});
    };
    
    var dropSuccessAction = function(target, dragged) {
        dragged.animate({height : defaultHeight / 2});
        dragged.animate({height : defaultHeight});
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
                var json = $.parseJSON(data);
                var src = "data:image/jpeg;base64," + json.imageSource;
                var sourceImg = new SourceImage(src, json.width, json.height);
            },
            error: function (data) {
                console.log("Failure!");
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
                new SourceImage(e.target.result, false, false);
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
    
    function SourceImage(imgSrc, width, height) {
        if (!(this instanceof SourceImage)) {
            return new SourceImage(imgSrc)
        }
        
        this.imageSource = imgSrc;
        
        if (width && height) {
            this.width = width;
            this.height = height;
        } else {
            this.height = defaultLargeHeight;
        }
                
        this.image = this.render(this);
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
                if ($(e.target).hasClass("large")) {
                    $(e.target).animate({
                        height: defaultHeight,
                        width: "auto"
                    });
                    $(e.target).removeClass("large");
                } else {
                    $(e.target).addClass("large");
                    $(e.target).animate({
                        //height: $(e.target).attr("originalHeight"),
                        height: defaultLargeHeight,
                        width: "auto"
                    });
                }
            });
        },
        
        render: function(sourceImage) {
            var newImg = $("<img />")
                .attr({
                    src: sourceImage.imageSource,
                    originalHeight: sourceImage.height,
                    originalWidth: sourceImage.width
                })
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