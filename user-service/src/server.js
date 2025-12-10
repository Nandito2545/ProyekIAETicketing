import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";
import { registerUser, loginUser, getAllUsers, deleteUser } from "./services/userService.js"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.join(__dirname, "../proto/user.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const userProto = grpc.loadPackageDefinition(packageDefinition).user;

const userService = {
  Register: async (call, callback) => {
    try {
      const { username, password, role, email, phone } = call.request;
      const user = await registerUser(username, password, role || "user", email, phone);
      callback(null, { message: "User registered successfully", user });
    } catch (err) {
      console.error("Register error:", err.message);
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },

  Login: async (call, callback) => {
    try {
      const { username, password } = call.request;
      const user = await loginUser(username, password);
      callback(null, { message: "Login successful", user });
    } catch (err) {
      console.error("Login error:", err.message);
      callback({ code: grpc.status.UNAUTHENTICATED, message: err.message });
    }
  },

  GetAllUsers: async (call, callback) => {
    try {
      const users = await getAllUsers();
      callback(null, { users: users });
    } catch (err) {
      console.error("GetAllUsers error:", err.message);
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },

  DeleteUser: async (call, callback) => {
    try {
      const { id } = call.request;
      const response = await deleteUser(id);
      callback(null, response);
    } catch (err) {
      console.error("DeleteUser error:", err.message);
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },
};

const server = new grpc.Server();
server.addService(userProto.UserService.service, userService);

const PORT = 50051;
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err) => {
  if (err) throw err;
  console.log(`✅ User Service running on port ${PORT}`);
  server.start();
});