class HttpException extends Error {
    public status: number;
    public message: string;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
        this.message = message;
    }
}

// interface HttpException {
//     status: number;
//     message: string;
// }

export default HttpException;
