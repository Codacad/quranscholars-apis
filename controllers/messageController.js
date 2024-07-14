import Message from "../models/message/message.js";
export const createMessage = async (req, res) => {
  const { firstName, lastName, email, message } = req.body;
  try {
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).send({ message: "All fields are required!" });
    }
    if (message.length < 20) {
      return res
        .status(400)
        .send({ message: "To short message, please write at 20 characters" });
    }

    const newMessage = await Message.create({
      firstName,
      lastName,
      email,
      message,
    });

    await newMessage.save();
    res.status(200).send({
      message: "Message sent successfully, we will get in touch with you soon.",
      newMessage,
    });
  } catch (error) {
    console.log(error.message);
  }
};
