const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const generateRandomString = function() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const getUserByEmail = function(email) {
  for (const id in users) {
    if (email === users[id]["email"]) {
      return users[id];
    }
  }
  return null;
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.redirect("/login");
  }
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]], id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.send("ShortURL is not in the database")
  }
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_login", templateVars);
});

app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.send("You are not logged in!\n");
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body["longURL"];
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  res.redirect(`/urls/${req.params.id}`);
});

app.post("/urls/:id", (req, res) => {
  const newURL = req.body.longURL;
  urlDatabase[req.params.id] = newURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.status(403).send("Email or Password are undefined");
  }
  const user = getUserByEmail(req.body.email);
  if (!user) {
    return res.status(403).send("User Not Found");
  }
  if (req.body.password !== user["password"]) {
    return res.status(403).send("Password is incorrect");
  }
  res.cookie("user_id", user.id).redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id").redirect('/login');
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.status(403).send("Email or Password are undefined");
  }
  const user = getUserByEmail(req.body.email);
  if (user) {
    return res.status(403).send("User already exists");
  }
  const userId = generateRandomString();
  users[userId] = { id: userId, email: req.body.email, password: req.body.password };
  res.cookie("user_id", userId).redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
