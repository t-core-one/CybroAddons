/** @odoo-module **/
import {registry} from "@web/core/registry";
import {useService} from "@web/core/utils/hooks";
import {usePopover} from "@web/core/popover/popover_hook";
import {Component} from "@odoo/owl";

/**
 * The `productDetailPopover` class defines a component to display detailed information about a product in a popover.
 */
export class productDetailPopover extends Component {
    setup() {
        this.actionService = useService("action");
    }
}

productDetailPopover.template = "product_web_hover.productDetailPopover";

export class productDetailWidget extends Component {
    setup() {
        this.orm = useService("orm");
        this.popover = usePopover(this.constructor.components.Popover, {position: "bottom"});
        this.productDetails = {};

    }
     async fetchProductDetails(productId) {
        const product = await this.orm.call("product.product", "read", [[productId], ["name", "image_1920", "lst_price","categ_id","default_code","qty_available", "standard_price"]]);
        return product[0];
    }

   async onMouseEnter(ev) {
      const productId = this.props.record.data.product_id?.[0];
        if (productId) {
            this.productDetails =  this.fetchProductDetails(productId);
        }
        this.popover.open(ev.currentTarget, {
            record: this.props.record,
            productDetails: await this.productDetails,

        });
   }

    onMouseLeave() {
        this.popover.close();
    }
}

productDetailWidget.components = {Popover: productDetailPopover};
productDetailWidget.template = "product_web_hover.productDetail";
export const ProductDetailWidget = {
    component: productDetailWidget,
};
registry.category("view_widgets").add("product_detail_popover_widget", ProductDetailWidget);