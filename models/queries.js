const db = require("./sql");
const SQL_DB_NAME = process.env.SQL_DB_NAME;

const addUser = (firstName, lastName, email, password, isAdmin = false, view = 'light', nextPasswordChange = new Date().getTime() + new Date(86400000 * 30).getTime()) => {
  return db.execute(
      "INSERT INTO `" +
      SQL_DB_NAME +
      "`.`users` (`firstName`, `lastName`, `email`, `password`, `isAdmin`, `view`, `nextPasswordChange`) VALUES(?, ?, ?, ?, ?, ?, ?)",
      [firstName, lastName, email, password, isAdmin, view, nextPasswordChange]
  );
};
const getUser = async (userId) => {
  const [
    users,
  ] = await db.execute(
    "SELECT firstName,lastName,view,id FROM store.users where id=?",
    [userId]
  );
  return users[0];
};
const login = (email, password) => {
  return db.execute(
    "SELECT * FROM " + SQL_DB_NAME + ".users WHERE email=? and password=?",
    [email, password]
  );
};
const updatePassword = async (email, oldPassword, newPassword, nextPasswordChange = new Date().getTime() + new Date(86400000 * 30).getTime()) => {
  const [users] = await db.execute(
      "SELECT * FROM " + SQL_DB_NAME + ".users WHERE email=? and password=?",
      [email, oldPassword]
  );
  const id = users[0].id;
  return db.execute(
      "UPDATE " + SQL_DB_NAME + ".users SET password=?, nextPasswordChange=? WHERE id=?",
      [newPassword, nextPasswordChange, id]
  );
};
const checkIfUserExists = (email) => {
  return db.execute("SELECT * FROM " + SQL_DB_NAME + ".users where email=?", [
    email,
  ]);
};

module.exports = { getUser, addUser, checkIfUserExists, login, updatePassword };
