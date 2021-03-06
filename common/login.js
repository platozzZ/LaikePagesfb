let loginIndex = {
    default: this,// for typescript
    isCMMC() {
        return this.getChannel().toLowerCase() == 'cmmc';
    },
    getChannel() {
        return uni.getStorageSync("tripartiteChannel");
    },
    getPhone() {
        return uni.getStorageSync("tripartitePhone");
    },
    login(me, url, isFirst, fun) {

        let phone = this.getPhone();
        //未登录
        if (this.isCMMC()) {
            if (isFirst) {
                return;
            }
            if (!phone) {
                //调用原生登录
                me.$bridge.call("cmmc.pushToLogin", '', (data) => {

                    // if (that.phonetype == "android") {
                    var newdata = JSON.parse(data);

                    let mobile = newdata.mobile;
                    uni.setStorage({
                        key: 'tripartitePhone',
                        data: mobile
                    });
                    uni.setStorageSync('user_phone', mobile);
                    this._loginH5(me,isFirst);
                    // if (url & url.length > 0) {
                    //     uni.navigateTo({
                    //         url: url
                    //     })
                    // }
                    // }
                })

            } else {
                if (!me.$store.state.access_id) {
                    //自动登录
                    this._loginH5(me,isFirst);
                }

            }
        }
        // else {
        //     if (typeof fun == "function") {
        //         fun();
        //     }
        // }
    },
    //渠道号和手机号自动登录
    _loginH5(me,isFirst) {
        let channel = this.getChannel();
        let phone = this.getPhone();
        let hasAccessid = uni.getStorageSync("hasAccessid");
        var data = {
            module: 'app',
            action: 'login',
            app: 'register_channel',
            phone: phone,
            access_id: "",
            clientid: uni.getStorageSync("cid"),
            channel_id: channel,
        };
        

        if ((!me.$store.state.access_id || hasAccessid) && phone && channel) {
            uni.request({
                data,
                url: "http://shoplk.fblife.com/index.php?store_id=47&store_type=2",
                method: 'POST',
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                success: (res) => {
                    let {
                        access_id,
                        wx_status
                    } = res.data;
                    // me.$store.state.access_id = [];
                    me.$store.commit("login", access_id);
                    me.$store.state.access_id = access_id;
                    uni.setStorage({
                        key: 'access_id',
                        data: access_id,
                        success: function () {

                        }
                    });
                    uni.setStorageSync("LoingByHand", true);
                    if(isFirst) return;
                    uni.reLaunch({
                        url: "/pages/tabBar/home"
                    });
                }
            })
        }
    },
    _loginOutH5: (me) => {
        uni.removeStorage({
            key: 'history'
        })

        uni.removeStorage({
            key: 'user_phone'
        })

        uni.removeStorage({
            key: 'hotStatu'
        })
        me.$store.state.cart = []
        me.$store.state.cart_id = []
        me.$store.state.nCart = []
        me.$store.state.shouquan = false

        // #ifdef MP
        uni.removeStorageSync("userinfo");
        uni.removeStorageSync("laiketuiAccessId");
        // #endif

        uni.removeStorageSync("online");
        uni.removeStorageSync("LoingByHand")

        let data = {
            module: 'app',
            action: 'login',
            app: 'quit',
            access_id: this.access_id
        }

        me.$req.post({
            data
        }).then(res => {

            me.$store.state.access_id = ''
            uni.removeStorage({
                key: 'access_id'
            })

            // uni.navigateTo({
            //     url: '../../pages/login/login?toHome=true&quit=true'
            // })

        })

    }
};


module.exports = loginIndex;