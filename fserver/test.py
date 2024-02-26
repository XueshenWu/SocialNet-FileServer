import requests

url = "http://localhost:9876/campass/test_add_text.txt"

with open("./package.json", "rb") as f:
    resp = requests.post(url, data=f.read(), headers={"Content-Type":"application/octet-stream"})
    print(resp.text)