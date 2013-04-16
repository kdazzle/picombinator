$(function() {
    var defaultHeight = 135;
    var defaultLargeHeight = 500;
    
    var initPage = function() {
        // Setup the dnd listeners.
        setupFileDropZone();
        setupRemoveImageDropZone();
        setupDefaultImagesLink();
    };
    
    var setupFileDropZone = function() {
        var dropZone = document.getElementById("addFilesDropZone");
        dropZone.addEventListener('dragover', handleDragOver, false);
        dropZone.addEventListener('drop', handleFileSelect, false);
    };
    
    var handleDragOver = function(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    };
    
    var handleFileSelect = function(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        var files = evt.dataTransfer.files; // FileList object.
        for (var i = 0, f; f = files[i]; i++) {
            if (f.type.split("/")[0] === "image") {
                createImageFromFile(f);
            }
        }
    };
    
    var setupRemoveImageDropZone = function() {
        $("#removeImagesDropZone").droppable({
            accept: ".sourceImg",
            over: function(event, ui) {
                deleteZoneDroppableAnimate(event.target, true);
            },
            
            out: function(event, ui) {
                deleteZoneDroppableAnimate(event.target, false);
            },
            
            drop: function(event, ui) {
                ui.draggable.remove();
                deleteZoneDroppableAnimate(event.target, false);
            }
        });
    };
    
    var deleteZoneDroppableAnimate = function(target, isOver) {
        if (isOver === true) {
            var color = "red";
            var opacity = ".6";
        } else {
            var color = "white";
            var opacity = "1";
        }
        
        $(target).animate({
            backgroundColor:color,
            opacity:opacity
        });
    };
    
    var setupDefaultImagesLink = function() {
        $("#loadDefaultImagesLink").bind("click", function() {
            var request = $.ajax({
                type: "POST",
                url: "/defaultImages",
                data: {
                    getDefaultImages: true
                },
                success: function (data) {
                    var json = $.parseJSON(data);
                    var imgSrc;
                    for (var i = 0; i < json.length; i++) {
                        createImageLoadContainer();
                        imgSrc = "data:image/jpeg;base64," + json[i];
                        new SourceImage(imgSrc, false, false);
                    };
                },
                error: function (data) {
                    displayFailedImageLoad(imageLoadContainer);
                },
                enctype: "multipart/form-data"
            });
        });
    };
    
    var deleteDefaultImagesLink = function() {
        if ($("#loadDefaultImagesLink").length > 0) {
            $("#loadDefaultImagesLink").parent().fadeOut(1000);
            setTimeout(function() {
                $("#loadDefaultImagesLink").parent().remove();
            }, 1000);
        }
    }
    
    var createImageFromFile = function(file) {
        var reader = new FileReader();
        reader.onload = (function(theFile) {
            return function(e) {
                createImageLoadContainer();
                new SourceImage(e.target.result, false, false);
            };
        })(file);
        
        reader.readAsDataURL(file);
    };
    
    var createImageLoadContainer = function() {
        var imageLoadContainer = $("<div />").addClass("imageLoad");
        var loadingGif = $("<img />")
            .attr("src", "/static/img/loading.gif")
            .addClass("loadingGif");
        $(imageLoadContainer).append(loadingGif);
        $("#imageContainer").append(imageLoadContainer);
        return imageLoadContainer;
    };
    
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
        
        renderCombinedImageFromServer(target, dragged);
    };
    
    var renderCombinedImageFromServer = function(image1, image2) {
        var imageLoadContainer = createImageLoadContainer();
        var request = $.ajax({
            type: "POST",
            url: "/",
            data: {
                image1: $(image1).attr("src").split(",")[1],
                image2: $(image2).attr("src").split(",")[1]
            },
            success: function (data) {
                var json = $.parseJSON(data);
                var src = "data:image/jpeg;base64," + json.imageSource;
                var sourceImg = new SourceImage(src, json.width, json.height);
            },
            error: function (data) {
                displayFailedImageLoad(imageLoadContainer);
            },
            enctype: "multipart/form-data",
        });
    };
    
    var displayFailedImageLoad = function(imageLoadContainer) {
        $(imageLoadContainer).children(".loadingGif").remove();
        $(imageLoadContainer).html("X");
        setTimeout(function() {
            $(imageLoadContainer).fadeOut(1000);
        }, 1000);
        
        setTimeout(function() {
            $(imageLoadContainer).remove();
        }, 3000);
    };
    
    function SourceImage(imgSrc, width, height) {
        if (!(this instanceof SourceImage)) {
            return new SourceImage(imgSrc)
        }
        
        if (width && height) {
            this.width = width;
            this.height = height;
        } else {
            this.height = defaultLargeHeight;
        }
                
        this.image = this.render(this, imgSrc);
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
        
        render: function(sourceImage, imageSrc) {
            var loadingGifContainer = $("#imageContainer").find(".loadingGif")[0];
            var imageLoadContainer = $(loadingGifContainer).parent();
            
            if (!imageLoadContainer) {
                imageLoadContainer = createImageLoadContainer();
            }
            
            var newImg = $("<img />")
                .attr({
                    src: imageSrc,
                    originalHeight: sourceImage.height,
                    originalWidth: sourceImage.width
                })
                .addClass("sourceImg");
            
            $(imageLoadContainer).children(".loadingGif").remove();
            
            $(imageLoadContainer).append(newImg);
            
            $(newImg).one("load", function() {
                $(imageLoadContainer).height($(newImg).height());
                $(imageLoadContainer).width($(newImg).width());
            });
            
            deleteDefaultImagesLink();
            
            return newImg;
        },
    };
    
    initPage();
});