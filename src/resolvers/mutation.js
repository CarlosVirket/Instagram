const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const {APP_SECRET,PRICES} = require("../const");
const {getUserId} = require('../utils/utils');

const getID = `{ id }`;

const queryUser = `{
    id,
    email,
    name,
    lastname,
    birth_date,
    subscription{
        id,
        end_date,
        subscription_type,
        price
    }
}`

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}
async function signup(parent,args,context,info) {
    const password = await bcrypt.hash(args.password,10)

    const user = await context.db.mutation.createUser(
        {data:{...args,password,subscription:{
            create:{
                subscription_type:"FREE",
                price:0,
                end_date:new Date().addDays(30),
            }
            }}},queryUser)

  

    const token = jsonwebtoken.sign({userId:user.id},APP_SECRET)

    return {
        token,
        user
    }
    
}

async function login(parent,args,context,info) {

    const user = await context.db.query.user({
        where:{email:args.email}
    })

    if(!user){
        throw new Error("Not such user find");
    }  
        const validPassword = await bcrypt.compare(args.password,user.password);

        if(!validPassword) throw new Error ("Invalid password")

        const token = await jsonwebtoken.sign({userId:user.id},APP_SECRET)

        return {
            token,
            user
        }
    
}

async function upgradeSuscription(parent,args,context,info){
    let user = getUserId(context);

    let days = (args.suscription_type == "PEMIUM") ? 90 : 30;

    let updateUser = await context.db.mutation.updateUser(
        {
            data:{
                suscription:{
                    update:{                    

                        suscription_type:args.suscription_type,
                        end_date: new Date().addDays(days),
                        price:PRICES[args.suscription_type]
                    }
                }
            },
            where:{
                id:user
            }
        },queryUser
    
    )

    return suscription;
    }


    module.exports={ 
        signup,
        login,
        upgradeSuscription
    }