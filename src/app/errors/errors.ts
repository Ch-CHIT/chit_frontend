// 2. 기본 CustomError 클래스 생성
class CustomError extends Error {
  code: number;
  status: number;
  constructor(errorData: {
    name: string;
    message: string;
    code: number;
    status: number;
  }) {
    super(errorData.message);
    this.name = errorData.name;
    this.code = errorData.code;
    this.status = errorData.status;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
  }
}

export default CustomError;
