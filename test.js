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

const getUserByEmail = function(email) {
  for (const id in users) {
    if (email === users[id]["email"]) {
      return users;
    }
  }
  return null;
};

console.log(getUserByEmail("user@example.com"));