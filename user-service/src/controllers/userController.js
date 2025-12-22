export const registerUser = (call, callback) => {
  const { usernamename, email, password, phone } = call.request;

  const newUser = {
    id: Math.floor(Math.random() * 1000),
    usernamename,
    email,
    password,
    phone,
  };

  callback(null, {
    message: "User registered successfully",
    user: newUser,
  });
};