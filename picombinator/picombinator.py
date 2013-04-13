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
        combinedImageStr = getCombinedImageStrFromPost()
        return json.dumps(
            {
                "image": combinedImageStr.encode("base64")
            }
        )
    else:
        return render_template("main.html")
        
def getCombinedImageStrFromPost():
    print("processing...")
    size = (1280, 960)
    
    file_like = cStringIO.StringIO(request.form["image1"].decode("base64"))
    image1 = Image.open(file_like)
    
    file_like = cStringIO.StringIO(request.form["image2"].decode("base64"))
    image2 = Image.open(file_like)
    
    file_like.close()
    
    combinedStr = interleaveImages(image1, image2)
    combinedImg = Image.fromstring("RGB", size, combinedStr)
    
    output = StringIO.StringIO()
    combinedImg.save(output, "JPEG")
    print("saved combined")
    
    returnVal = output.getvalue()
    
    output.close()
    
    return returnVal

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
    
if __name__ == "__main__":
    app.debug = True
    app.run()