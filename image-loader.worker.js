self.addEventListener("message", async event => {
  const imageURL = event.data;

  const response = await fetch(imageURL);
  const blob = await response.blob();
  var reader = new FileReader();
  reader.readAsDataURL(blob);
  reader.onloadend = function() {
    var base64data = reader.result;
    self.postMessage({
      imageURL: imageURL,
      data: base64data
    });
  };
  // Send the image data to the UI thread!
});
