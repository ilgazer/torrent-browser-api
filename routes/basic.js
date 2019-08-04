module.exports = ({ router }) => {
    // getting the home route
    router.get('/', (ctx) => {
        console.log(ctx);
        ctx.body = ctx;
    });
};