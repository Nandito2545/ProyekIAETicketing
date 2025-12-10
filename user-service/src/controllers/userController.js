export const registerUser = (call, callback) => {
  const { usernamename, email, password } = call.request;

  const newUser = {
    id: Math.floor(Math.random() * 1000),
    usernamename,
    email,
    password,
  };

  callback(null, {
    message: "User registered successfully",
    user: newUser,
  });
};