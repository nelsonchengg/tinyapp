const generateRandomString = function() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const getUserByEmail = function(email, users) {
  for (const id in users) {
    if (email === users[id]["email"]) {
      return users[id];
    }
  }
  return null;
};

const urlsForUser = function(id, urlDatabase) {
  const result = {};
  for (const shortURL in urlDatabase) {
    if (id === urlDatabase[shortURL]["userID"]) {
      result[shortURL] = urlDatabase[shortURL]["longURL"];
    }
  }
  return result;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser };