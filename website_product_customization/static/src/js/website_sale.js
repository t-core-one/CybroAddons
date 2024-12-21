/** @odoo-module **/
import { WebsiteSale } from '@website_sale/js/website_sale';
import { patch } from '@web/core/utils/patch';

// Patch the WebsiteSale class with custom modifications
patch(WebsiteSale.prototype,{

    async _submitForm(){
//        Super the function to update the design image if it has customized
        var image_element = document.getElementsByClassName("design_image_doc")
        if (parseInt(image_element.length) == parseInt(0)) {
            return super._submitForm(...arguments);
        }
         else {
        const params = this.rootProduct;
        if (document.getElementsByClassName('design_image_doc')[0]){
                    var design_image = document.getElementsByClassName('design_image_doc')[0].currentSrc;
        }
        params.design_image = design_image;
            return super._submitForm(...arguments);
        };
    },


    _serializeProduct(product) {
//    Updating the design_image value in case of the variant product
        var result = super._serializeProduct(...arguments);
        if (document.getElementsByClassName('design_image_doc')[0]) {
            result.design_image = document.getElementsByClassName('design_image_doc')[0].currentSrc;
        }
        return result;

    },

});
