export const dashbaord = async (req, res) => {
  res.status(200).send(req.user);
};
