const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const loadProto = (filename) => {
  const packageDefinition = protoLoader.loadSync(
    path.join(__dirname, '../proto', filename),
    { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true }
  );
  return grpc.loadPackageDefinition(packageDefinition);
};

const userProto = loadProto('user.proto');
const eventProto = loadProto('event.proto');
const paymentProto = loadProto('payment.proto');
const notificationProto = loadProto('notification.proto');

const userClient = new userProto.UserService(
  `${process.env.USER_SERVICE_HOST}:${process.env.USER_SERVICE_PORT}`,
  grpc.credentials.createInsecure()
);

const eventClient = new eventProto.EventService(
  `${process.env.EVENT_SERVICE_HOST}:${process.env.EVENT_SERVICE_PORT}`,
  grpc.credentials.createInsecure()
);

const ticketClient = new eventProto.TicketService(
  `${process.env.TICKET_SERVICE_HOST}:${process.env.TICKET_SERVICE_PORT}`,
  grpc.credentials.createInsecure()
);

const paymentClient = new paymentProto.PaymentService(
  `${process.env.PAYMENT_SERVICE_HOST}:${process.env.PAYMENT_SERVICE_PORT}`,
  grpc.credentials.createInsecure()
);

const notificationClient = new notificationProto.NotificationService(
  `${process.env.NOTIFICATION_SERVICE_HOST}:${process.env.NOTIFICATION_SERVICE_PORT}`,
  grpc.credentials.createInsecure()
);

module.exports = {
  userClient,
  eventClient,
  ticketClient,
  paymentClient,
  notificationClient
};
