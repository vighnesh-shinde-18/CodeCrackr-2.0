const asyncHandler = (func) => {
    return(
        async (req,res,next) =>{
            try{
                await func(req,res,next)
            }
            catch(error){
                console.error(error)
                const status = error.statusCode || 500
                res.status(status).json({
                    success:false,
                    message:error.message || "Something went wrong",
                    errors:error.errors || []
                })                
            }
        }
    );
}

export default asyncHandler;