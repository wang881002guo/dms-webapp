/**
 * Created by Jeng on 2016/1/8.
 */
define(function () {
    return ["$scope", "$modal", "$ugDialog","ExpressAPI", "OrderAPI",function($scope,$modal, $ugDialog,ExpressAPI,OrderAPI){

        $scope.currentDate = function(date){
            var myDate = date;
            var fullYear = myDate.getFullYear();    //获取完整的年份(4位,1970-????)
            var month = myDate.getMonth() + 1;       //获取当前月份(0-11,0代表1月)
            if(month < 10){
                month = '0'+month;
            }
            var date = myDate.getDate();        //获取当前日(1-31)
            if(date < 10){
                date = '0'+date;
            }
            return fullYear+"-"+month+"-"+date;
        };

        //已分配未提货订单
        $scope.orderTakeDeliveryList = [];
        $scope.pageInfoTakeDeliverySetting = {
            pageSize:10,
            pageNum:1
        };

        $scope.queryTakeDeliveryParam = {
            startTime :$scope.currentDate(new Date(new Date().getTime())),
            endTime:$scope.currentDate(new Date(new Date().getTime()))
        };
        $scope.getOrderTakeDeliveryList = function(){
            //查询已分配未提货的订单
            ExpressAPI.noScanOrder({
                limit:$scope.pageInfoTakeDeliverySetting.pageSize,
                offset:$scope.pageInfoTakeDeliverySetting.pageNum,
                keyword:$scope.queryTakeDeliveryParam.keyword,
                startTime:$scope.queryTakeDeliveryParam.startTime,
                endTime:$scope.queryTakeDeliveryParam.endTime
            }, function(data){
                $scope.orderTakeDeliveryList = data.data;
                $scope.pageInfoTakeDeliverySetting = data.pageInfo;
                $scope.pageInfoTakeDeliverySetting.loadData = $scope.getOrderTakeDeliveryList;
            });
        };
        $scope.getOrderTakeDeliveryList();

        $scope.orderList = [];
        $scope.pageInfoSetting = {
            pageSize:10,
            pageNum:1
        };

        $scope.queryParam = {
            startTime :$scope.currentDate(new Date(new Date().getTime())),
            endTime:$scope.currentDate(new Date(new Date().getTime()))
        };


        $scope.datepickerSetting = {
            datepickerPopupConfig:{
                "current-text":"今天",
                "clear-text":"清除",
                "close-text":"关闭"
            },
            startTime:{
                opened:false
            },
            endTime:{
                opened:false
            }
        };
        $scope.openDatepicker = function($event, index) {
            $event.preventDefault();
            $event.stopPropagation();
            if(index == 1){
                $scope.datepickerSetting.startTime.opened = true;
            }else if(index == 2){
                $scope.datepickerSetting.endTime.opened = true;
            }
        };

        $scope.getOrderList = function(){
            //查询提货的订单
            ExpressAPI.queryOrder({
                limit:$scope.pageInfoSetting.pageSize,
                offset:$scope.pageInfoSetting.pageNum,
                keyword:$scope.queryParam.keyword,
                hasNoShowCancel:true
            }, function(data){
                $scope.orderList = data.data;
                $scope.pageInfoSetting = data.pageInfo;
                $scope.pageInfoSetting.loadData = $scope.getOrderList;
            });
        };

        $scope.getOrderList();

        //扫描订单编号
        $scope.saoOrderNoEvent = function(e){
            var keycode = window.event?e.keyCode:e.which;
            if(keycode==13){
                $scope.takeDelivery();
            }
        }

        //
        $scope.takeDelivery = function(){
            if(!$scope.boxNo){
                $ugDialog.warn("请扫描条形码");
                return;
            }

            ExpressAPI.takeDelivery({
                boxNo:$scope.boxNo
            }, function(){
                $ugDialog.alert("提货成功");
                $scope.getOrderList();
                $("#boxNo").focus();
                $("#boxNo").select();
                $("#boxNo").val("");
                $scope.getOrderTakeDeliveryList();
            },function(data){
                $ugDialog.warn(data.data.message);
                $("#boxNo").focus();
                $("#boxNo").select();
                $("#boxNo").val("");
            })
        }

        $scope.unTakeDelivery = function(orderNo){
            ExpressAPI.unTakeDelivery({
                orderNo:orderNo
            }, function(){
                $ugDialog.alert("取消提货成功");
                $scope.getOrderList();
                $("#boxNo").focus();
                $("#boxNo").select();
                $("#boxNo").val("");
            },function(data){
                $ugDialog.warn(data.data.message)
                $("#boxNo").focus();
                $("#boxNo").select();
                $("#boxNo").val("");
            })
        }

        $scope.exportExcel = function(type){
            window.location.href = "/export/exportTakeDeliveryExcel?startTime="+$("#startTimeId").val()+"&endTime="+$("#endTimeId").val()+"&type="+type;
        }
    }];
});