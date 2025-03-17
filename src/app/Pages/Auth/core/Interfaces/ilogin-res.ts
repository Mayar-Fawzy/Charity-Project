
export interface ILoginRes {
    jwtModel: JwtModel
    refreshJWTModel: RefreshJwtmodel
 }
  export interface JwtModel {
    jwt: string
    jwtExpireDate: string
  }
  
  export interface RefreshJwtmodel {
    refreshJWT: string
    refreshJWTExpireDate: string
  }
  