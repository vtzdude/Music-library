class CustomError extends Error {
  status: number;

  constructor(message: any, status: number) {
    super(message);
    this.status = status;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default CustomError;
