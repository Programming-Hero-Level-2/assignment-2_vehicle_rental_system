const calculateDateDifference = (startDate: Date, endDate: Date): number => {
  return (
    Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1
  );
};

export default calculateDateDifference;
