export const getGreetingController = async (req, res) => {
  res.json({
    status: 200,
    message: 'Hello in my Contacts DB!',
  });
};
