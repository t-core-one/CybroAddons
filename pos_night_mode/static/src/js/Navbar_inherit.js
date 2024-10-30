/** @odoo-module **/
import { Navbar } from "@point_of_sale/app/navbar/navbar";
import { rpc } from '@web/core/network/rpc';
import { patch } from "@web/core/utils/patch";
import { useService } from "@web/core/utils/hooks";
import { useRef } from "@odoo/owl";

// Includes a function in navbar in pos
patch(Navbar.prototype, {
    setup() {
        super.setup()
        this.orm = useService("orm");
        var self = this;
        this.root = useRef("root")
        this.toggle = useRef("toggle")
        this.isProcessingClick = false;

        rpc('/web/dataset/call_kw',{
            model:'res.users',
            method:'get_active',
            args:[],
            kwargs:{},
        }).then((res)=>{
            if(res){
                this.root.el.classList.remove("fa", "fa-moon-o", "moon-color");
                this.root.el.classList.add("fa", "fa-sun-o", "sun-color");
                self._OnNightTrue();
            }
            else{
                this.root.el.classList.remove("fa", "fa-sun-o", "sun-color");
                this.root.el.classList.add("fa", "fa-moon-o", "moon-color");
            }
        });
    },
    //Added a function for click button change the pos color to black
    async OnClickMoon(){
        var self = this;
        if (this.isProcessingClick) return;  // If already processing, ignore the click
        this.isProcessingClick = true;
        var buttonToggle = this.root.el;
        var isPressed = buttonToggle.getAttribute('aria-pressed') === "true";
        console.log('pressed', isPressed)
        buttonToggle.setAttribute('aria-pressed', !isPressed);
        try{
            if(isPressed){
                console.log("moon")
                this.root.el.classList.remove("fa", "fa-moon-o", "moon-color")
                this.root.el.classList.add("fa", "fa-sun-o", "sun-color")
                console.log("moon", this.root.el.classList)
                await rpc('/web/dataset/call_kw',{
                    model:'res.users',method: 'set_active',
                    args:[],kwargs:{},
                }).then((response) =>{
                    console.log("on night")
                    self._OnNightTrue()
                });
            }
            else{
                console.log("false")
                this.root.el.classList.remove("fa", "fa-sun-o", "sun-color")
                this.root.el.classList.add("fa", "fa-moon-o", "moon-color")
                console.log("sun", this.root.el.classList)
                await rpc('/web/dataset/call_kw',{
                    model: 'res.users',method: 'set_deactivate',
                    args:[], kwargs:{},
                }).then((response) =>{
                    const styles = document.querySelectorAll('style');
                    styles.forEach(style => style.remove());
                });
            }
        } finally {
            this.isProcessingClick = false;  // Reset the flag once processing is complete
        }
    },
    //Added a function for click button change the pos color to black
    async _OnNightTrue(){
        var pos_element = document.querySelector('.pos')
        var pos_product_list_modifier = document.createElement('style')
        pos_product_list_modifier.innerHTML = '.pos{color:white;}'+'.pos .product { background-color:#3c3f41 !important;border:'+
        'thin solid white;border-radius: 5px;}.pos .product .product-img img {background-image:'+
        'linear-gradient(to bottom,white,#3c3f41) !important;}'+
        '.pos .product-list{background-color:#3c3f41 !important;}'+
        '.pos .product .price-tag {color:#F45976 !important;}'+
        '.pos .product-content .product-name{color:white}'+
        '.pos .order{background-color:#3c3f41}'+
        '.pos .rightpane{background-color:#3c3f41}'+
        '.pos .rightpane-header{background-color:#3c3f41;}'+
        '.pos .pos-content .product-screen .leftpane .pads .control-buttons .fw-bolder{color:white;}'+
        '.pos .breadcrumb-button{color:white}'+
        '.pos .form-control{color:black}'+
        '.pos .category-simple-button{background-color:#3c3f41 !important;}'+
        '.pos .sb-product .pos-search-bar{background-color:#3c3f41 !important;}'+
        '.pos .pos-search-bar input, .pos .partner-list'+
        '.pos-search-bar input{color:#880808}'+
        '.pos .orderline .selected{background-color:darkgray !important;}'+
        '.pos .info-list{color:#B3B7BF !important}'+
        '.pos .info-list em{color:#B3B7BF !important}'+
        '.pos .control-button{background-color:#3c3f41 !important;}'+
        '.pos .numpad button{background-color:#3c3f41;color:white;}'+
        '.pos .numpad button:hover{background-color:#f45976 !important;}'+
        '.pos .button.validation:hover{background-color:#f45976 !important;}'+
        '.pos .button.next.validation{background-color:#3c3f41;color:white;}'+
        '.pos .o_payment_successful h1{color:white;}'+ '.pos .top-content-center h1{color:white;}'+
        '.pos .pay-order-button{background-color:#3c3f41 !important;}'+
        '.pos .cc .button{background-color:#3c3f41;color:white;}'+
        '.pos .actionpad .button:hover{background-color:#f45976 !important;}'+
        '.pos .control-button:hover{background-color:#f45976 !important;}'+
        '.pos .modal-dialog .popup{background-color:#1e1f20 !important;}'+
        '.pos .popup .button{background:#8F3536;color: black !important};'+
        '.ticket-screen .controls button {background-color:white;color:black;}'+
        '.ticket-screen .pos-search-bar .filter{color:black}'+
        '.ticket-screen .pos-search-bar .filter .options{border-radius:5px}'+
        '.pos .order-container{background-color:#3c3f41 !important}'+
        '.pos .order-summary{background-color:#3c3f41 !important}'+
        '.pos .order-summary .subentry {color:white !important}'+
        '.pos .pos-content .product-screen .leftpane .pads .control-button .fa-undo{color:white !important}'+
        '.pos .partner-list{color:black;}'+
        '.pos .partner-list .table-hover thead > tr{background-color:#3c3f41;color:white}'+
        '.pos .partner-list tr.partner-line:hover{background-color:#f45976}'+
        '.pos .partner-list tr.partner-line.highlight{background-color:#017e84}'+
        '.screen .screen-content{background-color:#e0e2e6}'+
        '.pos .partner-list .ms-auto i{color:black;}'+
        '.pos .partner-list .ms-auto input{color:#2a2b2d;}'+
        '.screen .top-content .button.highlight{background-color:#017e84 !important;border-color:#3c3f41 !important;}'+
        '.screen .top-content{background-color:#3c3f41}'+
        '.pos .close-pos-popup header{background-color:rgb(56, 57, 58)}'+
        '.pos .popup .title{background-color:rgb(56, 57, 58)}'+
        '.pos .close-pos-popup .closing-notes{background-color:#c1c3c6}'+
        '.pos .opening-cash-control .opening-cash-notes{background-color:#c1c3c6}'+
        '.payment-screen .main-content{background:#3c3f41}'+
        '.paymentmethods .button{background:#3c3f41}'+
        '.pos .paymentline{background:#3c3f41}'+
        '.pos .paymentline.selected{background:#707375}'+
        '.pos .screen .button.next:not(.highlight){background:#e6e3e2;color:#017e84;}'+
        '.receipt-screen .default-view{background:#3c3f41}'+
        '.receipt-screen .default-view .actions .send-email input{background:#666668;color:white;}'+
        '.receipt-screen .default-view .actions .buttons .button{background:#666668}'+
        '.receipt-screen .default-view .actions .send-email button.send{background:#017e84;color:black}'+
        '.pos .pos-receipt-container > div{color:black}'+
        '.pos .popup.popup-error .button{background:#8F3536}'+
        '.pos .orders .order-row:nth-child(n){background:#3c3f41}'+
        '.pos .orders .order-row.highlight{background:#017e84}'+
        '.pos .orders .order-row:hover{background:#f45976;}'+
        '.pos .pos-content .product-screen .leftpane .bg-100:{background-color:#c1c3c6 !important}'+
        '.payment-screen .payment-buttons .button{background:#3c3f41;color:white;}'+
        '.payment-screen .payment-buttons .button:hover{background:#f45976}'+ '.paymentmethod{color:white;}'+
        '.o_notification_body{color:black;}'+
        '.modal-title{color:white;}'+ '.modal-header{color:white;}'+
        '.modal-content{background:#3c3f41; color:black;}'+ '.modal-body {color:white;}'+
        '.modal-body .button:hover{background:#f45976;}'+ '.modal-header .btn{background:#8F3536; color:white;}'+
        '.modal-footer .btn{background:#8F3536; color:white;}'+
        '.search-more-button .btn{background:#e6e3e2; color:black;}'+
        '.pos-receipt .order-container .orderline {background-color:white;}'+
        '.payment-infos{background-color:#3c3f41;}';
        pos_element.parentNode.insertBefore(pos_product_list_modifier, pos_element);
    },
});
