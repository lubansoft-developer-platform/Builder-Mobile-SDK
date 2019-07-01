
/**     
* @fileoverview iworks-app sdk, lubansoft copyright   
* @author lbDeveloper
* @version 1
*/

/**
* @desc LbSDK根对象
* @constructor
*/
function LbSDK() {

	var _web_sdk_ver = 1;

	/**
	* @private
	* @property {Object} - 内部对象
    */
	this.inner = {};

	/**
	* @desc 错误代码
	* @property {LbErrCode} - {@link 错误代码列表}
    */
	this.errcode = undefined;

	/**
	* @desc 基础业务
	* @property {LbBase} - 基础业务API
    */
	this.base = undefined;

	/**
	* @private
	* @desc 图形业务
	* @property {LbGraph} - 图形业务API
    */
	this.graph = undefined;

    /**
	* @desc 初始化sdk（最先调用），初始化完成后，在调用其它方法。
	* [required nativeSdkVer >= 1]
	* @method
    * @param {Object} listener - 监听器
	* @param {function} listener.onApplyToken - 申请token
	* @param {function} listener.onLog - 日志输出
    * @param {Callback} funCompleted - 完成回调，定义参见：{@link onLbCompleted}
    */
	this.asyInit = function (listener, funCompleted) {
		lbMobSDK.base.inner_registerGraphHandler(lbMobSDK.graph.inner_onHandleLogic);
		lbMobSDK.base.inner_init(listener, _web_sdk_ver, funCompleted);
	};

    /**
    * @desc 获取webSdk版本号
	* @method
	* @return {String}
    */
	this.getVer = function () {
		return _web_sdk_ver;
	};

	/**
    * @desc 获取NativeSdk版本号
	* [required nativeSdkVer >= 1]
	* @method
	* @return {String}
    */
	this.getNativeVer = function () {
		return lbMobSDK.base.getNativeVer();
	};
}

/**
* @private
* @desc 工具类（内部对象）
* @constructor
 */
function LbUtil() {

	/**
    * @desc 打印debug=0级别，日志信息
	* @method
	* @param {String} strLog - 日志信息
    */
	this.debug_log = function (strLog) {
		this.printf_log(0, _log_tag + strLog);
	};

	/**
    * @desc 打印info=1级别，日志信息
	* @method
	* @param {String} strLog - 日志信息
    */
	this.info_log = function (strLog) {
		this.printf_log(1, _log_tag + strLog);
	};

	/**
    * @desc 打印error=2级别，日志信息
	* @method
	* @param {String} strLog - 日志信息
    */
	this.error_log = function (strLog) {
		this.printf_log(2, _log_tag + strLog);
	};

	/**
	* @desc 构造失败结果
	* @method
	* @param {String} strErrMsg - 错误信息
	* @param {String} errCode - 错误代码，定义参见：{@link LbErrCode}
    * @return {Object} - 定义参见：{@link onLbCompleted} opRes对象
	*/
	this.makeFaildRes = function (strErrMsg, errCode) {
		var result = new Object;
		result.succ = false;
		result.errmsg = (strErrMsg === undefined ? "" : strErrMsg);
		result.errcode = (errCode === undefined ? lbMobSDK.errcode.UNKNOW_ERROR : errCode);
		result.data = "";
		return result;
	};

	/**
	* @desc 构造成功结果
	* @method
	* @param {Object} data - 业务数据
    * @return {Object} - 定义参见：{@link onLbCompleted} opRes对象
	*/
	this.makeSuccRes = function (data) {
		var result = new Object;
		result.succ = true;
		result.data = (data === undefined ? "" : data);
		result.errmsg = "";
		result.errcode = lbMobSDK.errcode.NONE;
		return result;
	};

	// 内部方法
	//----------------------------------------------------------------------------------------------------//
	var _loger_notify = null;
	var _log_tag = "[lbMobSDK] ";
	var _sn = 0;
	var _mapFun = {};	// callback map

    /**
    * @private
	* @desc 设置输出log回调方法
    */
	this.setLogerNotify = function (logNotify) {
		_loger_notify = logNotify;
	};

    /**
    * @private
	* @desc 安全方法调用
    */
	this.callFun = function (fun, param) {
		if (this.isFunction(fun)) {
			fun(param);
		}
	};

    /**
    * @private
	* @desc 检查目标对象是否为方法类型
    */
	this.isFunction = function (targetFun) {
		if (targetFun != null && typeof targetFun === "function") {
			return true;
		} else {
			this.error_log(targetFun + "invalid function type");
		}
	};

	/**
    * @private
	* @desc 输出日志
    */
	this.printf_log = function (ilevel, strLog) {
		if (_loger_notify != undefined && _loger_notify != null && this.isFunction(_loger_notify)) {
			_loger_notify(ilevel, strLog);
		}
	};

    /**
    * @private
    * @desc 构造nativeSdk请求数据包，返回格式化字符串协议数据
    */
	this.makeReqestPacket = function (code, sn, pver, param) {

		var strEncode = "";
		try {
			var strParam = JSON.stringify(param);
			strEncode = window.encodeURIComponent(strParam);
		} catch (error) {
			strEncode = "webSdk makeReqestPacket encodeURIComponent exception " + error;
		}

		//  var strPacket = String.format("fc={0}&sn={1}&pver={2}&rdata={3}",code,sn,pver,strEncode);
		var strPacket = "fc=" + code + "&sn=" + sn + "&pver=" + pver + "&param=" + strEncode;
		return strPacket;
	};

	/**
    * @private
    * @desc 构造webSdk响应数据包，返回格式化字符串协议数据
    */
	this.makeResponsePacket = function (code, sn, rver, rdata) {

		var strEncode = "";
		try {
			var strData = JSON.stringify(rdata);
			strEncode = window.encodeURIComponent(strData);
		} catch (error) {
			strEncode = "webSdk makeResponsePacket encodeURIComponent exception " + error;
		}

		//    var strPacket = String.format("fc={0}&sn={1}&rver={2}&rdata={3}",code,sn,rver,strEncode);
		var strPacket = "fc=" + code + "&sn=" + sn + "&rver=" + rver + "&rdata=" + strEncode;
		return strPacket;
	};

	/**
    * @private
    * @desc 向nativeSdk发送数据包，默认设置5s超时
    */
	this.send_asyRequest = function (code, pver, param, funResponse, timeout) {

		var sn = this.getUniqueSN();
		var strPacket = this.makeReqestPacket(code, sn, pver, param);

		if (!getLbUtil().isFunction(funResponse)) { // 不需要回调通知结果
			var targetUrl = "mldn://" + strPacket;
			document.location = targetUrl;
			return;
		}

		// 记录回调函数
		this.register_funResponse(code, sn, funResponse, timeout);

		var targetUrl = "mldn://" + strPacket;
		document.location = targetUrl;

	};

	/**
    * @private
    * @desc 添加回调方法记录
    */
	this.register_funResponse = function (code, sn, funResponse, timeout) {
		var funKey = "" + code + "-" + sn;
		var timerId = -1;
		var timeVal = timeout === undefined ? 5000 : timeout;    // 设置超时值
		if (timeVal > 0) {
			timerId = window.setTimeout(function () {
				getLbUtil().checkReqTimeout(code, sn);
			}, 5000);
		}

		var kVal = {};
		kVal.funResponse = funResponse;
		kVal.timerId = timerId;
		_mapFun[funKey] = kVal;
	}

	/**
    * @private
    * @desc 获取唯一的整形序列号
    */
	this.getUniqueSN = function () {
		return ++_sn;
	}

	/**
    * @private
    * @desc 检查响应超时
    */
	this.checkReqTimeout = function (code, sn) {
		var funResponse = this.get_funResponse(code, sn);
		if (funResponse != null) {
			var opFaild = getLbUtil().makeFaildRes("request timeout", lbMobSDK.errcode.OPERATION_TIMEOUT);
			getLbUtil().callFun(funResponse, opFaild);
		}
	}

	/**
    * @private
    * @desc 获取回调方法
    */
	this.get_funResponse = function (code, sn, delAttr) {
		var fun = null;
		var funKey = "" + code + "-" + sn;
		if (_mapFun.hasOwnProperty(funKey)) {
			var kVal = _mapFun[funKey];
			fun = kVal.funResponse;

			// 关闭定时器
			if (kVal.timerId > 0) {
				window.setTimeout(kVal.timerId);
				kVal.timerId = -1;
			}

			// 默认移除掉callback
			var removeAttr = true;
			if (typeof delAttr === 'boolean' && delAttr != null) {
				removeAttr = delAttr;
			}
			if (removeAttr) {
				delete _mapFun[funKey];
			}
		}
		return fun;
	}

	/**
    * @private
    * @desc 检查对象是否为"响应结果"数据类型
      字符串：'{"succ": true,"data":xxx,"errmsg": "","errcode":-1}'
    */
	this.isResDataType = function (obj) {

		if (obj === undefined || obj == null) return false;

		var type = obj;
		if (typeof obj === 'string') {
			try {
				type = JSON.parse(obj);
			} catch (error) {
				return false;
			}
		}

		// 必须是对象类型
		if (typeof type != 'object') {
			return false;
		}

		// 检查字段合法性
		if (!type.hasOwnProperty("succ") || typeof type.succ != 'boolean') {
			return false;
		}

		if (!type.succ && (!type.hasOwnProperty("errmsg") || !type.hasOwnProperty("errcode"))) {
			return false;
		}

		if (type.succ && !type.hasOwnProperty("data")) {
			return false;
		}

		return true;
	};

	/**
    * @private
	* @desc 填充错误信息
    */
	this.fillFiladInfo = function (faildResult, source) {

		faildResult.errmsg = "unknow error";
		if (source === undefined || source == null) return;

		if (source.hasOwnProperty("errcode")) {
			faildResult.errcode = source.errcode;
		} else {
			result.errcode = lbMobSDK.errcode.UNKNOW_ERROR;
		}

		if (source.hasOwnProperty("errmsg")) {
			faildResult.errmsg = source.errmsg;
		} else {
			faildResult.errmsg = "unknow error";
		}

	}

}

/**
* @private
* @desc 通信协议（内部对象）
* @constructor
*/
function LbProtocol() {

	// 业务代码
	//----------------------------------------------------------------------------------------//
	this.CODE_UNKNOW = -1;
	this.CODE_INTERVAL = 1000;

	// 基础业务
	this.CODE_BASE_MIN = 0;
	this.CODE_WEB_REQ_HANDSHAKE = this.CODE_BASE_MIN + 1;				// webSdk初始化
	this.CODE_GET_CUR_USER_LOGIN_TICKET = this.CODE_BASE_MIN + 2;		// 获取当前用户登陆凭证
	this.CODE_APPLY_TOKEN = this.CODE_BASE_MIN + 3;						// 申请lbToken
	this.CODE_GET_TOKEN = this.CODE_BASE_MIN + 4;						// 获取lbToken
	this.CODE_GET_CUR_MENU_POSTION = this.CODE_BASE_MIN + 5;			// 获取当前页面菜单位置
	this.CODE_SEL_REF_TO = this.CODE_BASE_MIN + 6;						// 关联到工程/构件/构件类型
	this.CODE_REF_LOCATION = this.CODE_BASE_MIN + 7;					// 反查关联到工程/构件/构件信息
	this.CODE_OPEN_WEB_PAGE = this.CODE_BASE_MIN + 8;					// 新打开一个本地web页面
	this.CODE_WEB_PAGE_FINISH_CALLBACK = this.CODE_BASE_MIN + 9;		// 关闭当前web页面回调通知
	this.CODE_CLOSE_CUR_WEB_PAGE = this.CODE_BASE_MIN + 10;				// 关闭当前web页面
	this.CODE_CHECK_APP_UPGRADE = this.CODE_BASE_MIN + 11;				// 检查app版本更新
	this.CODE_BASE_MAX = this.CODE_BASE_MIN + this.CODE_INTERVAL;

	// 图形业务
	this.CODE_GRAPH_MIN = this.CODE_BASE_MAX + 1;
	//............
	this.CODE_GRAPH_MAX = this.CODE_GRAPH_MIN + this.CODE_INTERVAL;

	//其他常量
	//关联性
	this.REF_TO_PROJECT = 1;											// 关联工程
	this.REF_TO_COMP = 2;												// 关联构件
	this.REF_TO_COMP_TYPE = 3;											// 关联构件类型

	//----------------------------------------------------------------------------------------//

	// 构造 初始化（协商通信）请求参数
	this.make_Handshake_ReqParam = function (webSdkVer) {
		/*
			ver=1 数据格式
			{
				"webSdkVer":1
			}
		*/
		var reqParam = {};
		reqParam.ver = 1;
		reqParam.data = {};
		reqParam.data.webSdkVer = webSdkVer;
		return reqParam;
	};

	// 解析 初始化（协商通信）响应结果
	this.parse_Handshake_ResParam = function (ver, strdata) {
		/*
			ver=1 数据格式
			{
				"succ":true,
				"errmsg":"",
                "errcode":0,
				"data":{
					"nativeSdkVer":1,
					"initPageData":{json业务数据}
				 }
			}
		*/
		var result = getLbUtil().makeFaildRes();

		try {
			var tRes = JSON.parse(strdata);
			var isSucc = tRes.hasOwnProperty("succ") ? tRes.succ : false;
			if (!isSucc) { // 失败
				getLbUtil().fillFiladInfo(result, tRes);
				return result;
			}

			var data = {};
			var count_field = 0;

			if (tRes.data.hasOwnProperty("nativeSdkVer")); {
				data.nativeSdkVer = tRes.data.nativeSdkVer;
				count_field++;
			}

			if (tRes.data.hasOwnProperty("initPageData")); {
				data.initPageData = tRes.data.initPageData;
				count_field++;
			}

			if (count_field < 2)
				throw "data fields exception";

			result = getLbUtil().makeSuccRes(data);

		} catch (error) {
			getLbUtil().error_log("parse_Handshake_ResParam exception " + error);
		}

		return result;
	};

	// 构造 请求参数
	this.make_Common_Data_ReqParam = function (ver, data) {
		/*
			ver=1 数据格式
			{
				"data": {}
			}
		*/
		var reqParam = {};
		reqParam.ver = ver;
		reqParam.data = data;
		return reqParam;
	}

	// 构造 空data 请求参数
	this.make_Empty_Data_ReqParam = function () {
		/*
			ver=1 数据格式
			{
				// 空字段
			}
		*/
		var reqParam = {};
		reqParam.ver = 1;
		reqParam.data = {};
		return reqParam;
	};

	// 解析，空data 响应结果
	this.parse_Empty_Data_ResParam = function (ver, strdata) {
        /*
			ver=1 数据格式
			{
				"succ":true,
				"errmsg":"",
                "errcode":0,
				"data":{
					
				 }
			}
		*/
		var result = getLbUtil().makeFaildRes();

		try {
			var tRes = JSON.parse(strdata);
			var isSucc = tRes.hasOwnProperty("succ") ? tRes.succ : false;
			if (!isSucc) { // 失败
				getLbUtil().fillFiladInfo(result, tRes);
				return result;
			}

			var data = {};
			result = getLbUtil().makeSuccRes(data);

		} catch (error) {
			getLbUtil().error_log("parse_Empty_Data_ResParam exception " + error);
		}

		return result;
	}

	// 构造 获取当前用户登陆凭证 请求参数
	this.make_GetLoginTicket_ReqParam = this.make_Empty_Data_ReqParam;

	// 解析 初始化（协商通信）响应结果
	this.parse_GetLoginTicket_ResParam = function (ver, strdata) {
        /*
			ver=1 数据格式
			{
				"succ":true,
				"errmsg":"",
                "errcode":0,
				"data":"ticket"
			}
		*/
		var result = getLbUtil().makeFaildRes();

		try {
			var tRes = JSON.parse(strdata);
			var isSucc = tRes.hasOwnProperty("succ") ? tRes.succ : false;
			if (!isSucc) { // 失败
				getLbUtil().fillFiladInfo(result, tRes);
				return result;
			}

			result = getLbUtil().makeSuccRes(tRes.data);

		} catch (error) {
			getLbUtil().error_log("parse_GetLoginTicket_ResParam exception " + error);
		}

		return result;
	};

	// 构造 申请lbToken 请求参数
	this.make_ApplyToken_ReqParam = function (appid, secret) {
		/*
			ver=1 数据格式
			{
				"appid":"xxxxx",
                "secret":"yyyyy"
			}
		*/
		var reqParam = {};
		reqParam.ver = 1;
		reqParam.data = {};
		reqParam.data.appid = appid;
		reqParam.data.secret = secret;
		return reqParam;
	};

	// 解析 申请lbToken 响应结果
	this.parse_ApplyToken_ResParam = function (ver, strdata) {
        /*
			ver=1 数据格式
			{
				"succ":true,
				"errmsg":"",
                "errcode":0,
				"data":"token"
			}
		*/

		var result = getLbUtil().makeFaildRes();

		try {
			var tRes = JSON.parse(strdata);
			var isSucc = tRes.hasOwnProperty("succ") ? tRes.succ : false;
			if (!isSucc) { // 失败
				getLbUtil().fillFiladInfo(result, tRes);
				return result;
			}

			result = getLbUtil().makeSuccRes(tRes.data);

		} catch (error) {
			getLbUtil().error_log("parse_ApplyToken_ResParam exception " + error);
		}

		return result;
	};

	// 构造 获取当前所在菜单层级位置（所属企业id、项目部id、工程id） 请求参数
	this.make_GetCurMenuPostion_ReqParam = this.make_Empty_Data_ReqParam;

	// 解析 获取当前所在菜单层级位置（所属企业id、项目部id、工程id） 响应结果
	this.parse_GetCurMenuPostion_ResParam = function (ver, strdata) {
		/*
		   ver=1 数据格式
		   {
			   "succ":true,
			   "errmsg":"",
			   "errcode":0,
			   "data":{
				   "corpId":"企业id",
				   "corpName":"企业名称",
				   "depId":"项目部id",
				   "depName":"项目部名称",
				   "projId":"工程id",
				   "projName":"工程名称",
				}
		   }
	   */

		var result = getLbUtil().makeFaildRes();

		try {
			var tRes = JSON.parse(strdata);
			var isSucc = tRes.hasOwnProperty("succ") ? tRes.succ : false;
			if (!isSucc) { // 失败
				getLbUtil().fillFiladInfo(result, tRes);
				return result;
			}
			result = getLbUtil().makeSuccRes(tRes.data);
		} catch (error) {
			getLbUtil().error_log("parse_GetCurMenuPostion_ResParam exception " + error);
		}

		return result;
	};

	// 解析 选择关联到工程/构件/构件类型 响应结果
	this.parse_SelRef_ResParam = function (ver, strdata) {
		/*
			ver=1 数据格式
			{
				"succ":true,
				"errmsg":"",
                "errcode":0,
				"
				": {@link refDetail}
			}
		*/

		var result = getLbUtil().makeFaildRes();

		try {
			var tRes = JSON.parse(strdata);
			var isSucc = tRes.hasOwnProperty("succ") ? tRes.succ : false;
			if (!isSucc) { // 失败
				result = getLbUtil().fillFiladInfo(result, tRes);
				return result;
			}

			if (!tRes.data.hasOwnProperty("type")) {
				result = getLbUtil().makeFaildRes("ref type field can not be empty");
				return result;
			}

			result = getLbUtil().makeSuccRes(tRes.data);

		} catch (error) {
			getLbUtil().error_log("parse_SelRef_ResParam exception " + error);
		}

		return result;

	};

	// 解析 反查定位 响应结果
	this.parse_RefLocation_ResParam = this.parse_Empty_Data_ResParam;

	// 构造/解析 打开web页面 请求参数
	this.make_OpenWebPage_ReqParam = function (url, cCode, cSN) {
		/*
			ver=1 数据格式
			{
				"url":"",
				"cCode":1，选填参数， 关闭页面，回调业务代码 
				"cSN":1 选填参数， 关闭页面，回调序列号
			}
		*/
		var reqParam = {};
		reqParam.ver = 1;
		reqParam.data = {};
		reqParam.data.url = url;
		if (cCode != undefined && cCode != null) {
			reqParam.data.cCode = cCode;
		}
		if (cSN != undefined && cSN != null) {
			reqParam.data.cSN = cSN;
		}
		return reqParam;
	};
	this.parse_OpenWebPage_ResParam = this.parse_Empty_Data_ResParam;

	// web页面完成回调
	this.parse_WebPageFinishCallback_ResParam = function (ver, strdata) {
		/*
			ver=1 数据格式
			{
				"succ":true,
				"errmsg":"",
                "errcode":0,
				"data":{
					"finishParam":{} 回调数据对象
				 }
			}
		*/

		var result = getLbUtil().makeFaildRes();

		try {
			var tRes = JSON.parse(strdata);
			var isSucc = tRes.hasOwnProperty("succ") ? tRes.succ : false;
			if (!isSucc) { // 失败
				getLbUtil().fillFiladInfo(result, tRes);
				return result;
			}

			// var data = {};

			// if (tRes.data.hasOwnProperty("finishParam")); {
			// 	data.finishParam = tRes.data.finishParam;
			// }

			result = getLbUtil().makeSuccRes(tRes.data);

		} catch (error) {
			getLbUtil().error_log("parse_WebPageFinishCallback_ResParam exception " + error);
		}

		return result;
	}

	// 关闭当前web页面
	this.make_CloseCurPage_ReqParam = function (data) {
		/*
			ver=1 数据格式
			{
				"data":{自定义参数}
			}
		*/
		var reqParam = {};
		reqParam.ver = 1;
		reqParam.data = data === undefined ? {} : data;
		return reqParam;
	};
	this.parse_CloseCurPage_ResParam = this.parse_Empty_Data_ResParam;

	// 检查app版本更新
	this.make_Check_AppUpgrade_ReqParam = this.make_Empty_Data_ReqParam;
	this.parse_Check_AppUpgrade_ResParam = this.parse_Empty_Data_ResParam;

}

/**
* @desc 错误代码列表
* @constructor
*/
function LbErrCode() {

	/**
	* @property {Number} - 成功，无错误
    */
	this.NONE = -1;

	/**
	* @property {Number} - 未知错误
    */
	this.UNKNOW_ERROR = 0;

	/**
	* @property {Number} - 无效参数
    */
	this.INVALID_PARAM = 1;

	/**
	* @property {Number} - 通信协议异常，检查运行环境
    */
	this.PROTOCOL_EXCEPTION = 2;

	/**
	* @property {Number} - webSdk版本高于nativeSdk，本地Sdk部分特性可能不支持。常见两种办法：
	1. 限制全部功能使用，建议用户升级App版本
	2. 根据具体业务功使用的webAPI（查看required nativeSdkVer），选择性限制部分功能使用
    */
	this.NATIVE_SDK_VER_LOW = 3;

	/**
	* @property {Number} - 操作超时
    */
	this.OPERATION_TIMEOUT = 4;
}

/**
* @constructor
* @desc 基础业务
*/
function LbBase() {

	/**
	* @private
	* @desc 初始化实现
	*/
	this.inner_init = function (listener, webSdkVer, funCompleted) {

		// 防止重复调用
		if (_init_status != -2) {
			var opSucc = getLbUtil().makeFaildRes("init sdk is running"); // -1
			if (_init_status == 0) {
				opSucc = getLbUtil().makeFaildRes("init sdk faild");
			} else if (_init_status == 1) {
				opSucc = getLbUtil().makeSuccRes("init sdk success");
			}
			getLbUtil().callFun(funCompleted, opSucc);
			return;
		}

		// 参数检查
		if (listener === undefined || listener == null) {
			var opFaild = getLbUtil().makeFaildRes("sdk init listener param can not be empty !", lbMobSDK.errcode.INVALID_PARAM);
			getLbUtil().callFun(funCompleted, opFaild);
			return;
		}

		if (!getLbUtil().isFunction(listener.onApplyToken)) {
			var opFaild = getLbUtil().makeFaildRes("sdk listener.onApplyToken function must be define !", lbMobSDK.errcode.INVALID_PARAM);
			getLbUtil().callFun(funCompleted, opFaild);
			return;
		}

		_init_status = -1;  // mark running

		// 初始化变量
		_listener = listener;
		_web_sdk_ver = webSdkVer;
		getLbUtil().setLogerNotify(_listener.onLog);

		// 开始和NativeSdk建立连接
		startNativeSdkHandshake(funCompleted);
	};

	/**
	* @desc 获取NativeSdk版本号
	* [required nativeSdkVer >= 1]
	* @method
	* @return {String}
	*/
	this.getNativeVer = function () {
		return _native_sdk_ver;
	};

	/**
	* @desc 获取页面初始参数，可以通过url或者asyOpenWebPage传递
	* [required nativeSdkVer >= 1]
	* @method
	* @return {Object}
	*/
	this.getPageInitParam = function () {
		return _initPageParam;
	};;

	/**
	* @desc 获取当前用户登录凭证，用于校验鲁班用户身份
	* [required nativeSdkVer >= 1]
	* @method
	* @param {Callback} funCompleted - 完成回调，定义参见：{@link onLbCompleted}
	*/
	this.asyGetUserLoinTicket = function (funCompleted) {
		var reqParam = getLbProtocol().make_GetLoginTicket_ReqParam();
		getLbUtil().send_asyRequest(_protocol.CODE_GET_CUR_USER_LOGIN_TICKET, reqParam.ver, reqParam.data, funCompleted);
	};

	/**
	* @desc 申请token
	* [required nativeSdkVer >= 1]
	* @method
	* @param {String} appid appid
	* @param {String} secret secret
	* @param {Callback} funCompleted - 完成回调，定义参见：{@link onLbCompleted}
	*/
	this.asyApplyToken = function (appid, secret, funCompleted) {
		// 参数检查
		if (appid === undefined || appid == null) {
			var opFaild = getLbUtil().makeFaildRes("asyApplyToken appid param can not be empty !", lbMobSDK.errcode.INVALID_PARAM);
			getLbUtil().callFun(funCompleted, opFaild);
			return;
		}

		if (secret === undefined || secret == null) {
			var opFaild = getLbUtil().makeFaildRes("asyApplyToken secret param can not be empty !", lbMobSDK.errcode.INVALID_PARAM);
			getLbUtil().callFun(funCompleted, opFaild);
			return;
		}

		var reqParam = getLbProtocol().make_ApplyToken_ReqParam(appid, secret);
		getLbUtil().send_asyRequest(_protocol.CODE_APPLY_TOKEN, reqParam.ver, reqParam.data, funCompleted);
	};

	/**
	* @desc 获取当前页面所在的菜单位置，返回当前所属企业、项目部(可为空）、工程(可为空）
	* [required nativeSdkVer >= 1]
	* @method
	* @param {Callback} funCompleted - 完成回调，定义参见：{@link onLbCompleted}
	*/
	this.asyGetCurMenuPostion = function (funCompleted) {
		var reqParam = getLbProtocol().make_GetCurMenuPostion_ReqParam();
		getLbUtil().send_asyRequest(_protocol.CODE_GET_CUR_MENU_POSTION, reqParam.ver, reqParam.data, funCompleted);
	};

	/**
       * @desc 选择关联到工程/构件/构件类型等
	   refInfo -- 关联信息
	   {
		   "type":1,		// 关联类型，定义参见：{@link REF_TO_PROJECT ; REF_TO_COMP ; REF_TO_COMP_TYPE}
		   "refId":"1" 		// id，native回传，选填
	   }
	   
	   refDetail
	   {
		   "type":1,		// 关联类型，同refInfo，
							// 值为1（REF_TO_PROJECT）时 : refProj有效；
							// 值为2（REF_TO_COMP）时 : refProj，refComps有效；
							// 值为3（REF_TO_COMP_TYPE）时 : refProj，refCompTypes有效；
		   "refId":"1", 	// id，native回传，选填
		   
		   "refProj": {
			   // 关联到工程
			   "ppid":1,			// 工程id，唯一标识
			   "projName":"",		// 工程名称
			   "projType":""		// 工程类型
		   }
		   
		   "refComps":[{
			   // 关联到构件
			   "floor":"",			// 楼层
			   "compClass":"",		// 大类
			   "subClass":"",		// 小类
			   "spec":"",			// 专业，仅安装类型有效
			   "handle":"",			// 构件handle，唯一标识
			   "attrname":""		// 构件名称
		   },{...}]

		   "refCompTypes":[{
			   // 关联到构件类型
			   "floor":"",			// 楼层
			   "compClass":"",		// 大类
			   "subClass":"",		// 小类
			   "spec":""			// 专业，仅安装类型有效
		   },{...}]
		   
	   }
	   
       funCompleted -- 返回结果，成功时data字段，回传refInfo关联信息
	   
	   * [required nativeSdkVer >= 1]
	   * @method
	   * @param {Object} refInfo - 关联信息
	   * @param {Callback} funCompleted - 完成回调，定义参见：{@link onLbCompleted}
    */
	this.asySelRef = function (refInfo, funCompleted) {
		// 参数检查
		if (refInfo === undefined || refInfo == null) {
			var opFaild = getLbUtil().makeFaildRes("asySelRef refInfo param can not be empty !", lbMobSDK.errcode.INVALID_PARAM);
			getLbUtil().callFun(funCompleted, opFaild);
			return;
		}

		if (refInfo.type === undefined || refInfo.type == null) {
			var opFaild = getLbUtil().makeFaildRes("asySelRef refInfo.type field can not be empty !", lbMobSDK.errcode.INVALID_PARAM);
			getLbUtil().callFun(funCompleted, opFaild);
			return;
		}

		var reqParam = getLbProtocol().make_Common_Data_ReqParam(1, refInfo);
		getLbUtil().send_asyRequest(_protocol.CODE_SEL_REF_TO, reqParam.ver, reqParam.data, funCompleted, -1); // 不设置超时
	};

	/**
	* @desc 反查定位,关联到工程/构件/构件类型
	* [required nativeSdkVer >= 1]
	* @method
	* @param {Object} refDetail - 反查详情信息
	* @param {Callback} funCompleted - 完成回调，定义参见：{@link onLbCompleted}
    */
	this.asyRefLocation = function (refDetail, funCompleted) {

		// 参数检查
		if (refDetail === undefined || refDetail == null) {
			var opFaild = getLbUtil().makeFaildRes("asyRefLocation refDetail param can not be empty !", lbMobSDK.errcode.INVALID_PARAM);
			getLbUtil().callFun(funCompleted, opFaild);
			return;
		}

		if (refDetail.type === undefined || refDetail.type == null) {
			var opFaild = getLbUtil().makeFaildRes("asyRefLocation refDetail.type field can not be empty !", lbMobSDK.errcode.INVALID_PARAM);
			getLbUtil().callFun(funCompleted, opFaild);
			return;
		}

		var reqParam = getLbProtocol().make_Common_Data_ReqParam(1, refDetail);
		getLbUtil().send_asyRequest(_protocol.CODE_REF_LOCATION, reqParam.ver, reqParam.data, funCompleted);
	};

	/**
	* @desc 新开一个本地web页面
		url : http://www.xxx.html?pageInfo=urlEncode(x)
		pageInfo -- 页面信息，格式参考：
		{ 
			"config":{
				"title":"",						//标题
				"titleColor":"#ffffff",			//标题颜色
				"titleGravity":"LEFT",			//标题位置，可选值：LEFT，CENTER
				"showBack":true,				//是否显示返回按钮
				"showClose":true,				//是否显示关闭按钮
				"showStatusBar":true,			//是否显示状态栏，仅fullScreen=true时有效，否则忽略
				"backgroundColor":"#ff0000",	//背景色
				"fullScreen":false,				//是否全屏
			},
			"initParam":{页面初始化数据，可以通过getPageInitParam方法获取数据，选填}
		}
	* [required nativeSdkVer >= 1]
	* @method
	* @param {Object} url - 目标网址
	* @param {Callback} funCompleted - 完成回调，定义参见：{@link onLbCompleted}
	* @param {Callback} [funPageFinishCallback] - 页面关闭时回调，定义参见：{@link onLbCompleted}
	*/
	this.asyOpenWebPage = function (url, funCompleted, funPageFinishCallback) {
		// 参数检查
		if (url === undefined || url == null) {
			var opFaild = getLbUtil().makeFaildRes("asyOpenWebPage url can not be empty !", lbMobSDK.errcode.INVALID_PARAM);
			getLbUtil().callFun(funCompleted, opFaild);
			return;
		}

		var closeCB_sn = null; var closeCB_code = null;
		if (funPageFinishCallback != undefined) { // 设置关闭页面时，回调通知
			closeCB_code = _protocol.CODE_WEB_PAGE_FINISH_CALLBACK;
			closeCB_sn = getLbUtil().getUniqueSN();
			getLbUtil().register_funResponse(closeCB_code, closeCB_sn, funPageFinishCallback, -1); // no timeout
		}

		var reqParam = getLbProtocol().make_OpenWebPage_ReqParam(url, closeCB_code, closeCB_sn);
		var code = _protocol.CODE_OPEN_WEB_PAGE;
		var sn = getLbUtil().getUniqueSN();
		getLbUtil().register_funResponse(code, sn, funCompleted, -1); // no timeout

		getLbUtil().send_asyRequest(_protocol.CODE_OPEN_WEB_PAGE, reqParam.ver, reqParam.data, function (opResult) {
			if (!opResult.succ) {	// remove callback funtion
				getLbUtil().get_funResponse(closeCB_code, closeCB_sn);
			}

			var raw_funCompleted = getLbUtil().get_funResponse(code, sn);
			getLbUtil().callFun(raw_funCompleted, opResult);
		}, -1);
	};

	/**
	* @desc 关闭当前页面
	* [required nativeSdkVer >= 1]
	* @method
	* @param {Object} userParam - 页面返回参数
	* @param {Callback} funCompleted - 完成回调，定义参见：{@link onLbCompleted}
	*/
	this.asyCloseCurPage = function (userParam, funCompleted) {
		var reqParam = getLbProtocol().make_CloseCurPage_ReqParam(userParam);
		getLbUtil().send_asyRequest(_protocol.CODE_CLOSE_CUR_WEB_PAGE, reqParam.ver, reqParam.data, funCompleted);
	};

	/**
	* @desc 检查app版本更新，本地程序会引导用户升级
	* [required nativeSdkVer >= 1]
	* @method
	* @param {Callback} funCompleted - 完成回调，定义参见：{@link onLbCompleted}
	*/
	this.asyCheckUpgrade = function (funCompleted) {
		var reqParam = getLbProtocol().make_Check_AppUpgrade_ReqParam();
		getLbUtil().send_asyRequest(_protocol.CODE_CHECK_APP_UPGRADE, reqParam.ver, reqParam.data, funCompleted);
	}

	// 内部方法
	//----------------------------------------------------------------------------------------------------//
	var _DEV_MODE = true;
	var _init_status = -2; // -2:未开始，-1:初始化中 0:初始化失败 1:初始化完成
	var _listener = null;
	var _web_sdk_ver = -1;
	var _native_sdk_ver = -1;
	var _initPageParam = "";
	var _graph_handler = null;
	var _protocol = getLbProtocol();

	/**
	* @private
	* @desc 注册图形业务函数
	*/
	this.inner_registerGraphHandler = function (funHandler) {
		_graph_handler = funHandler;
	};

	/**
	* @private
	* @desc 此方法由本地代码回调消息通知
	*/
	this.inner_onNativeResponse = function (strPacket) {

		var mapParams = parseUrlParams(strPacket);
		var code = mapParams.hasOwnProperty("fc") ? parseInt(mapParams["fc"]) : _protocol.CODE_UNKNOW;   // 功能代码
		var sn = mapParams.hasOwnProperty("sn") ? parseInt(mapParams["sn"]) : -1;  // 序列号,识别请求次序
		var strData = mapParams.hasOwnProperty("rdata") ? mapParams["rdata"] : null; // 业务数据
		var rver = mapParams.hasOwnProperty("rver") ? parseInt(mapParams["rver"]) : 0;  // rdata.data，业务数据版本
		var rdata = decodeData(strData);

		// 检查数据有效性
		if (!checkResDataValid(code, sn, rver, rdata)) {
			var opResult = getLbUtil().makeFaildRes("invalid param !");
			return opResult;
		}

		var opSucc = false;
		if (code > _protocol.CODE_BASE_MIN && code < _protocol.CODE_BASE_MAX) { // 基础业务
			opSucc = handleBaseLogic(code, sn, rver, rdata);
		} else if ((code > _protocol.CODE_GRAPH_MIN && code < _protocol.CODE_GRAPH_MAX) && typeof _graph_handler != undefined) { // 图形业务
			opSucc = _graph_handler(code, sn, rver, rdata);
		} else {
			getLbUtil().error_log("inner_onNativeResponse unhandle code: " + code + ",param:" + strPacket);
		}

		var opResult = opSucc ? getLbUtil().makeSuccRes("succeed") : getLbUtil().makeFaildRes("some error happend");
		return opResult;
	};

	/* 本地sdk通信握手（初始化） */
	var startNativeSdkHandshake = function (funCompleted) {
		var reqParam = getLbProtocol().make_Handshake_ReqParam(_web_sdk_ver);
		getLbUtil().send_asyRequest(_protocol.CODE_WEB_REQ_HANDSHAKE, reqParam.ver, reqParam.data, funCompleted);
	};

	/* 检查webSdk、nativeSdk 版本兼容性 */
	var checkVersion = function (webSdkVer, nativeSdkVer, funCompleted) {
		if (nativeSdkVer <= 0) {	/* 获取nativeSdkVerion失败，通信异常，检查运行环境 */
			var opFaild = getLbUtil().makeFaildRes("nativeSdkVerion exception , check runtime environment !", lbMobSDK.errcode.PROTOCOL_EXCEPTION);
			getLbUtil().callFun(funCompleted, opFaild);
			return false;
		}

		if (webSdkVer == nativeSdkVer) { /* 最佳模式 */
			return true;
		} else if (webSdkVer < nativeSdkVer) { /* 本地sdk，兼容webSdk所有特性 */
			return true;
		} else { /* webSdk版本高，本地Sdk部分特性可能不支持，建议升级App版本 */
			var opFaild = getLbUtil().makeFaildRes("nativeSdkVerion low , advise upgrade app !", lbMobSDK.errcode.NATIVE_SDK_VER_LOW);
			getLbUtil().callFun(funCompleted, opFaild);
			return false;
		}
	};

	/* 解析Url参数 */
	var parseUrlParams = function (strUrlParam) {
		var params = {};
		var strs = strUrlParam === undefined ? {} : strUrlParam.split("&");
		for (var i = 0; i < strs.length; i++) {
			params[strs[i].split("=")[0]] = strs[i].split("=")[1];
		}
		return params;
	};

	/* 解码业务数据 */
	var decodeData = function (strData) {
		var rdata = null;

		try {
			rdata = window.decodeURIComponent(strData);
		} catch (error) {
			getLbUtil().error_log("decodeData exception " + error);
		}

		return rdata;
	}

	/* 检查响应结果，是否合法 */
	var checkResDataValid = function (code, sn, rver, rdata) {

		if (code < 0) {
			getLbUtil().error_log("invalid response fc field , must be >= 0");
			return false;
		}

		if (rver <= 0) {
			getLbUtil().error_log("invalid response rver field , must be >= 1");
			return false;
		}

		if (rdata === undefined || rdata == null) {
			getLbUtil().error_log("invalid response rdata field , cant not be empty");
			return false;
		}

		// 检查rdata字段
		if (!getLbUtil().isResDataType(rdata)) {
			getLbUtil().error_log('invalid response rdata field , data style must be {"succ": true,"data": jsondata,"errmsg": ""} ');
			return false;
		}

		return true;

	};

	/* 基础业务分发处理 */
	var handleBaseLogic = function (code, sn, rver, rdata) {

		var succ = false;
		if (code == _protocol.CODE_WEB_REQ_HANDSHAKE) {
			succ = handleHandshake(code, sn, rver, rdata);
		} else if (code == _protocol.CODE_GET_CUR_USER_LOGIN_TICKET) {
			succ = onGetUserLoginTicket(code, sn, rver, rdata);
		} else if (code == _protocol.CODE_APPLY_TOKEN) {
			succ = onApplyToken(code, sn, rver, rdata);
		} else if (code == _protocol.CODE_GET_TOKEN) {
			succ = onGetToken();
		} else if (code == _protocol.CODE_GET_CUR_MENU_POSTION) {
			succ = onGetCurMenuPostion(code, sn, rver, rdata);
		} else if (code == _protocol.CODE_SEL_REF_TO) {
			succ = onSelRef(code, sn, rver, rdata);
		} else if (code == _protocol.CODE_REF_LOCATION) {
			succ = onRefLocation(code, sn, rver, rdata);
		} else if (code == _protocol.CODE_OPEN_WEB_PAGE) {
			succ = onOpenWebPage(code, sn, rver, rdata);
		} else if (code == _protocol.CODE_WEB_PAGE_FINISH_CALLBACK) {
			succ = onWebPageFinishCallback(code, sn, rver, rdata);
		} else if (code == _protocol.CODE_CLOSE_CUR_WEB_PAGE) {
			succ = onCloseCurPage(code, sn, rver, rdata);
		} else if (code == _protocol.CODE_CHECK_APP_UPGRADE) {
			succ = onCheckAppUpgrade(code, sn, rver, rdata);
		}

		if (!succ) {
			getLbUtil().info_log("handleBaseLogic falid");
		}

		return succ;
	};

	/* 处理初始化响应 */
	var handleHandshake = function (code, sn, rver, rdata) {

		_init_status = 0; // 先标记failid
		var funCompleted = getLbUtil().get_funResponse(code, sn);

		var result = getLbProtocol().parse_Handshake_ResParam(rver, rdata);
		if (!result.succ) {
			getLbUtil().callFun(funCompleted, result);
			return false;
		}

		if (result.data.hasOwnProperty("nativeSdkVer")) {
			_native_sdk_ver = result.data.nativeSdkVer;
		}

		if (result.data.hasOwnProperty("initPageData")) {
			_initPageParam = result.data.initPageData;
		}

		// 检查websdk、nativesdk版本是否兼容
		if (!checkVersion(_web_sdk_ver, _native_sdk_ver, funCompleted)) {
			return;
		}

		// 初始化完成
		_init_status = 1;
		var opSucc = getLbUtil().makeSuccRes("init sdk success");
		getLbUtil().callFun(funCompleted, opSucc);

		return true;
	};

	/* 处理登陆凭证响应 */
	var onGetUserLoginTicket = function (code, sn, rver, rdata) {
		var funCompleted = getLbUtil().get_funResponse(code, sn);
		var result = getLbProtocol().parse_GetLoginTicket_ResParam(rver, rdata);

		getLbUtil().callFun(funCompleted, result);
		return result.succ;
	};

	/* 处理申请token响应 */
	var onApplyToken = function (code, sn, rver, rdata) {
		var funCompleted = getLbUtil().get_funResponse(code, sn);
		var result = getLbProtocol().parse_ApplyToken_ResParam(rver, rdata);

		getLbUtil().callFun(funCompleted, result);
		return result.succ;
	};

	/* 获取当前页面的token */
	var onGetToken = function () {
		if (_listener != null) {
			_listener.onApplyToken(function (opResult) {
				var reqParam = getLbProtocol().make_Common_Data_ReqParam(1, opResult);
				getLbUtil().send_asyRequest(_protocol.CODE_GET_TOKEN, reqParam.ver, reqParam.data);
			})
			return true;
		}
		return false;
	}

	/* 处理当前页面位置响应 */
	var onGetCurMenuPostion = function (code, sn, rver, rdata) {
		var funCompleted = getLbUtil().get_funResponse(code, sn);
		var result = getLbProtocol().parse_GetCurMenuPostion_ResParam(rver, rdata);

		getLbUtil().callFun(funCompleted, result);
		return result.succ;
	};

	/* 处理选择关联到响应 */
	var onSelRef = function (code, sn, rver, rdata) {
		var funCompleted = getLbUtil().get_funResponse(code, sn);
		var result = getLbProtocol().parse_SelRef_ResParam(rver, rdata);

		getLbUtil().callFun(funCompleted, result);
		return result.succ;
	};

	/* 处理 反查定位 响应 */
	var onRefLocation = function (code, sn, rver, rdata) {
		var funCompleted = getLbUtil().get_funResponse(code, sn);
		var result = getLbProtocol().parse_RefLocation_ResParam(rver, rdata);

		getLbUtil().callFun(funCompleted, result);
		return result.succ;
	};

	/* 处理打开web页面响应 */
	var onOpenWebPage = function (code, sn, rver, rdata) {
		var funCompleted = getLbUtil().get_funResponse(code, sn);
		var result = getLbProtocol().parse_OpenWebPage_ResParam(rver, rdata);

		getLbUtil().callFun(funCompleted, result);
		return result.succ;
	};

	/* 处理页面完成通知 */
	var onWebPageFinishCallback = function (code, sn, rver, rdata) {
		var funCompleted = getLbUtil().get_funResponse(code, sn);
		var result = getLbProtocol().parse_WebPageFinishCallback_ResParam(rver, rdata);

		getLbUtil().callFun(funCompleted, result);
		return result.succ;
	}

	/* 处理关闭当前页面响应 */
	var onCloseCurPage = function (code, sn, rver, rdata) {
		var funCompleted = getLbUtil().get_funResponse(code, sn);
		var result = getLbProtocol().parse_CloseCurPage_ResParam(rver, rdata);

		getLbUtil().callFun(funCompleted, result);
		return result.succ;
	};

	/* 处理检查app更新响应 */
	var onCheckAppUpgrade = function (code, sn, rver, rdata) {
		var funCompleted = getLbUtil().get_funResponse(code, sn);
		var result = getLbProtocol().parse_Check_AppUpgrade_ResParam(rver, rdata);

		getLbUtil().callFun(funCompleted, result);
		return result.succ;
	};

	//----------------------------------------------------------------------------------------------------//
}

/**
* @private
* @constructor
* @desc 图形业务，暂时不对外开放
*/
function LbGraph() {

	/**
	* @private
	*/
	this.inner_onHandleLogic = function (code, sn, rver, rdata) {
		return false;
	}

}

// 全局方法
//----------------------------------------------------------------------------------------------------//

/**
* @desc [函数示例] 异步方法执行完成回调通知
* @function
* @param {Object} opRes - 完成结果
* @param {Boolean} opRes.succ - 状态，ture:成功，false:失败
* @param {String} opRes.errmsg - 错误消息，仅失败有效
* @param {Number} opRes.errcode - 错误代码，定义参见：{@link LbErrCode}，仅失败有效
* @param {Object} opRes.data - 业务数据对象，仅成功有效
*/
function onLbCompleted(opRes) {
}

/**
* @private
* @desc 工具方法
*/
function getLbUtil() {
	return lbMobSDK.inner.util;
}

/**
* @private
* @desc 工具方法
*/
function getLbProtocol() {
	return lbMobSDK.inner.protocol;
}

//----------------------------------------------------------------------------------------------------//

/**
* @global
* @desc 通过lbMobSDK全局变量访问sdk特性，{@link LbSDK} 
*/
var lbMobSDK = new LbSDK();

/* 内部对象 */
lbMobSDK.inner.util = new LbUtil();
lbMobSDK.inner.protocol = new LbProtocol();

lbMobSDK.errcode = new LbErrCode();

lbMobSDK.base = new LbBase();

lbMobSDK.graph = new LbGraph();