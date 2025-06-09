class apiError extends Error{
    constructor(statusCode,error=[],msg="Something went wrong",stack=""){
        super(msg);
        this.statusCode=statusCode;
        this.error=error;
        this.msg=msg;
        this.data=null
        this.success=false;
        if(stack){
            this.stack=stack;
        }
        else{
            Error.captureStackTrace(this,this.constructor);
        }
    }
}

export default apiError