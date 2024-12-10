export const failResponse = async (errorBit: boolean, msg: any, response?: any, status: any = 400, data = null) => {
  response.status(status).send({ status, error: errorBit, message: msg, data: !!data ? data : null });
};
export const successResponse = async (message: string, data?: any, response?: any, status: any = 200) => {
  response.status(status).send({ status, error: false, message, data });
};
