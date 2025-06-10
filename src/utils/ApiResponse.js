class ApiResponse{
    constructor(statusCode,msg,data=null,success=true,stack=""){
        this.statusCode=statusCode;
        this.msg=msg;
        this.data=data;
        this.success=statusCode<400;
       
    }
}

export default ApiResponse;