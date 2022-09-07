const scrap = require("./scrap");
const express = require("express");
const path = require("path");
const app = new express();
const port = process.env.PORT || 8080;
const fs = require('fs');
const { login } = require('./login.js');

app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`> "${req.originalUrl}"  User Agent: ${req.get('user-agent')}`);
  next();
})

function loggedIn(req, res, next) {
  if (fs.existsSync('./cookies.json')) {
    next();
  } else {
    res.redirect('login');
  }
};



app.route('/')
  .get(loggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, 'view/search.html'));

  })
  .post((req, res) => {

    scrap.download(req.body.code, req.body.date).then((data) => {
      if (data.invalidDetails) {
        res.send(`<div style="border:1px solid red; margin:0 auto; width:400px;border-left-width:10px; padding:4px 28px 4px 8px;">Please enter the valid details</div>`);
      } else {
        res.download(path.join(__dirname, 'public/' + data.fileName));
        console.log("> " + "File Sent to User");
        console.log("\n");


      }


    }).catch((error) => {
      if (!error.loggedIn) {

        fs.unlink("./cookies.json", () => {
          console.log("> " + "Removing Old Sessions");

          res.redirect('/');
        });
      }
    });

  });

app.route('/login')
  .get((req, res) => {
    if (fs.existsSync('./cookies.json')) {
      res.redirect('/');
    }
    res.sendFile(path.join(__dirname, './view/login.html'));
  })
  .post((req, res) => {
    login(req.body.code, req.body.pass).then((result) => {
      if (result.loggedIn) {
        res.redirect("/");
      }
    })
      .catch(e => {
        res.send(`<div style="border:1px solid red; margin:0 auto; width:400px;border-left-width:10px; padding:4px 28px 4px 8px;">${e}</div>`);
      })
  })

app.get('/userAgent', (req, res) => {
  res.send(req.get('user-agent'));
});

app.get('/logout', (req, res) => {
  console.log("> " + "Logging out...");

  fs.unlink("./cookies.json", () => {
    res.redirect('/');
  });

});

const dobValidator = dob => {
  if (dob.length !== 10) return false;
  if (dob.charAt(2) !== "-" || dob.charAt(5) !== "-") return false;

  return true;
}

app.get("/api", (req, res)=>{
  res.sendFile(path.join(__dirname, './view/api.html'));
})

app.route("/api/:id")
  .get((req, res) => {
    let code = req.params.id;
    let dob = req.query.dob;

    if (!dob) {
      return res.json({
        "error": {
          "code": 0001,
          "message": "Date of Birth was not provided in the Request. Made a GET Request with proper Params and Query. e.g., GET:api/01C0509E?dob=23-04-1979"
        }
      })
    }
    var dobValidated = dobValidator(dob);
    if (!dobValidated) {
      return res.json({
        "error": {
          "code": 0002,
          "message": "dob format is not validated. Proper Format : (DD-MM-YYYY) e.g., GET:api/01C0509E?dob=23-04-1979"
        }
      })

    }

    dob = dob.replaceAll("-", "/");

    // api/01C0509E?dob=23-04-1979&code=1013649&pass=6268&forceLogin=true
    scrap.download(code, dob).then((data) => {
      if (data.invalidDetails) {
        return res.json({
          "error": {
            "code": 0003,
            "message": "Either Code or DOB is not validated."
          }
        })
      } else {
        res.download(path.join(__dirname, 'public/' + data.fileName));
        console.log("> " + "File Sent to User");
        console.log("\n");
      }


    }).catch((error) => {
      if (!error.loggedIn) {

        fs.unlink("./cookies.json", () => {
          console.log("> " + "Removing Old Sessions");
        });
        login("1013649", "6268").then((result) => {
          if (result.loggedIn) {
            // USER HAS LOGGED IN AGAIN REPEAT THE PROPCESS
            scrap.download(code, dob).then((data) => {
              if (data.invalidDetails) {
                return res.json({
                  "error": {
                    "code": 0003,
                    "message": "Either Code or DOB is not validated."
                  }
                })
              } else {
                res.download(path.join(__dirname, 'public/' + data.fileName));
                console.log("> " + "File Sent to User");
                console.log("\n");
              }


            }).catch((error) => {
              return res.json({
                "error": {
                  "code": 0005,
                  "message": error
                }
              })
            })

            // USER HAS LOGGED IN AGAIN REPEAT THE PROPCESS


          } else {
            return res.json({
              "error": {
                "code": 0004,
                "message": "Error while logging in."
              }
            })
          }
        })


      }
    });

  })

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'view/404.html'));


})

app.listen(port, () => {
  console.log("> " + "Listening to port " + port);
});
