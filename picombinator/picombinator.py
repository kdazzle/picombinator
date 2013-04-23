import os
import sys
import json
import base64
import cStringIO, StringIO
import Image

from flask import Flask
from flask import render_template
from flask import request

app = Flask(__name__)

IMG_DIR = os.path.realpath(os.path.join(__file__, "..", "static", "img"))

@app.route("/", methods=["POST", "GET"])
def index():
    if request.method == "POST":
        imageInfo = getCombinedImageInfo()
        return json.dumps(
            {
                "imageSource": imageInfo["imageSource"].encode("base64"),
                "height": imageInfo["height"],
                "width": imageInfo["width"]
            }
        )
    else:
        return render_template("main.html")
        
@app.route("/defaultImages", methods=["POST"])
def defaultImages():
    if request.method == "POST":
        print("getting defaults")
        output1 = StringIO.StringIO()
        image1 = Image.open(os.path.join(IMG_DIR, "default1.jpg"))
        image1.save(output1, "JPEG")
        image1 = output1.getvalue()
        
        output2 = StringIO.StringIO()
        image2 = Image.open(os.path.join(IMG_DIR, "default2.jpg"))
        image2.save(output2, "JPEG")
        image2 = output2.getvalue()
        
        output3 = StringIO.StringIO()
        image3 = Image.open(os.path.join(IMG_DIR, "default3.jpg"))
        image3.save(output3, "JPEG")
        image3 = output3.getvalue()
        
        output1.close()
        output2.close()
        output3.close()
        
        return json.dumps(
            [
                image1.encode("base64"),
                image2.encode("base64"),
                image3.encode("base64"),
            ]
        )
        
def getCombinedImageInfo():
    print("processing...")
    
    file_like = cStringIO.StringIO(request.form["image1"].decode("base64"))
    image1 = Image.open(file_like)
    
    file_like = cStringIO.StringIO(request.form["image2"].decode("base64"))
    image2 = Image.open(file_like)
    
    if (image1.size == image2.size):
        combinedImg = Image.blend(image1, image2, .5)
    else:
        combinedStr = interleaveImages(image1, image2)
        size = getSize(image1, image2)
        combinedImg = Image.fromstring("RGB", size, combinedStr)
    
    
    output = StringIO.StringIO()
    combinedImg.save(output, "JPEG")
    
    imageInfo = {
        "imageSource": output.getvalue(),
        "height": combinedImg.size[1],
        "width": combinedImg.size[0]
    }
    
    file_like.close()
    output.close()
    
    return imageInfo

def interleaveImages(image1, image2):
    text1 = image1.tostring()
    text2 = image2.tostring()
    
    len1 = len(text1)
    len2 = len(text2)
    
    if (len1 >= len2):
        maxLength = len1
    else:
        maxLength = len2
    
    composite = ""
    for i in xrange(maxLength):
        if (i < len2):
            composite += text2[i]
        else:
            composite += text2[i % len2]

        if (i < len1):
            composite += text1[i]
        else:
            composite += text1[i % len1]
            
    return composite
    
def getSize(image1, image2):
    if image1.size[0] > image2.size[0]:
        size = image1.size
    else:
        size = image2.size
        
    return size
    
if __name__ == "__main__":
    app.debug = True
    app.run()