import os
import json
import base64
import cStringIO, StringIO
import Image

from flask import Flask
from flask import render_template
from flask import request

app = Flask(__name__)

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
        
def getCombinedImageInfo():
    print("processing...")
    
    file_like = cStringIO.StringIO(request.form["image1"].decode("base64"))
    image1 = Image.open(file_like)
    
    file_like = cStringIO.StringIO(request.form["image2"].decode("base64"))
    image2 = Image.open(file_like)
    
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