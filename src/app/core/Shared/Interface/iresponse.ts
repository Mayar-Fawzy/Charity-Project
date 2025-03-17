
export interface IResponse {
    statusCode: number
    isSucceeded: boolean
    message: string
    errors: string
    meta: any
   
}
  
export interface IResponseResult<TResult> extends IResponse {
    data: TResult
}