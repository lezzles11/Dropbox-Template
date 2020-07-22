/*
0. Set up the packages
- What are the packages you will need? 
- What are the variables that are needed? 
*/

const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const path = require("path");

/*
1. Create a HTTP Server. (express)
*/
const app = express();
const port = 3000;
// We wanted to store the cache (which means data)
let caches = {};
let arrayOfFiles;
// uploadDirectory is the path to our directory named uploaded, where we will store our cached files, path.sep provides the platform specific path segment separator
const uploadDirectory = __dirname + path.sep + "uploaded";

app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());
// Server the uploaded folder to the server, allowing the users to download cached information.
app.use(express.static("uploaded"));
app.use(express.static("public/"));

/*
2. Handle HTTP Request.
*/
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/pages/index.html");
});

/*
2. Read file from local (fs with Promise)
Remember, a promise is an object that tells you whether an action 
is successful or not.  It accepts two arguments: resolve and reject
Resolve: if the job finishes, the promise will return a resolve object 
Reject: if an error occurs, the promise will return an error object 
*/
// readFile is a function which takes the file as an input, it goes to the 'uploaded' directory that we serve via express. It will then look for the name of the file that we pass into the function, the promise will resolve with the body of the file (the data)

function readFile(file) {
  return new Promise((resolve, reject) => {
    // Get the directory
    const dirname = __dirname + "/uploaded/" + file;
    console.log("Directory name: " + dirname);
    console.log("Reading file!");
    fs.readFile(dirname, (err, body) => {
      if (err) {
        return reject(err);
      } else {
        console.log(resolve(body));
        // The promise will indicate if it works or not
        resolve(body);
      }
    });
  });
}

/*
3. Write file (that receives the name of the file, and the body of the content)
writeFile is a function which takes the name of the file and the body (data) for storage -
it will write the file to our uploadDirectory 'uploaded', this promise resolves with the name of the file
*/

function writeFile(name, body) {
  const dirname = __dirname + "/uploaded/" + name;
  console.log("Directory name: " + dirname);
  console.log("Writing file!");
  return new Promise((resolve, reject) => {
    // Get the directory
    fs.writeFile(dirname, body, (err) => {
      if (err) {
        return reject(err);
      } else {
        // If it is successful
        resolve(name);
      }
    });
    // then read file
  }).then(readFile);
}

/*
4. Pass file content to server via GET/POST request
*/

app.post("/files", (req, res) => {
  // after the request path upload.single('upload'),
  console.log(req.files);

  if (req.files.upload instanceof Array) {
    for (var i = 0; i < req.files.upload.length; i++) {
      let file = req.files.upload[i].name;
      let data = req.files.upload[i].data;
      caches[file] = writeFile(file, data);
      console.log(caches);
      caches[file]
        .then(() =>
          res.end(
            "Wow you sent a file, can you remember how to download it? Goto your browser, url: localhost:3000/uploaded/:file-name"
          )
        )
        .catch((error) => {
          console.log(error);
          res.end(error);
        });
    }
  } else {
    console.log(req.files);

    let file = req.files.upload.name;
    let data = req.files.upload.data;

    caches[file] = writeFile(file, data);

    caches[file]
      .then(() =>
        res.send(
          "Wow you sent a file, can you remember how to download it? Goto your browser, url: localhost:3000/uploaded/:file-name"
        )
      )
      .catch((e) => res.status(500).send(e.message));
  }
});
/*
5. Save file content to server (fs with Promise)
*/

/*
6. Handle HTTP Response.
*/

/*
7. Retrieve file content from server storage for the first request
*/

/*
8. Create middleware to cache (store) the response data. (using array)
*/

/*
9. Retrieve file content from cache afterward
*/

app.listen(port, () => {
  console.log("Listening on 3000");
});
