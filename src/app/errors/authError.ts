import CustomError from './errors';
// 1. 에러 코드 상수 정의
export const AuthErrorCode = {
  INVALIDE_AUTH_CODE: {
    name: 'InvalidAuthCodeError',
    status: 400,
    code: 301,
    message: '잘못된 인증 코드입니다. 다시 시도해 주세요.',
  },
};

// 3. SessionError 정의 (고유 코드값 지정)
class AuthError extends CustomError {
  constructor(errorCode = AuthErrorCode.INVALIDE_AUTH_CODE) {
    super({ ...errorCode });
  }
}

export default AuthError;
