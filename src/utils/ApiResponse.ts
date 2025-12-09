class ApiResponse<T> {
  success: boolean;
  constructor(
    public message: string = 'Success response',
    public statusCode: number,
    public data?: T
  ) {
    this.message = message;
    this.success = statusCode >= 200 && statusCode < 300;
    this.data = data;
  }
}

export default ApiResponse;
