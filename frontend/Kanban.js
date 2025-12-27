// Logic to group SQL rows by status
const groupByStatus = (data) => {
  return data.reduce((acc, log) => {
    (acc[log.status] = acc[log.status] || []).push(log);
    return acc;
  }, {});
};
