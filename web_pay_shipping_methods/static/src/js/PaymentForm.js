/** @odoo-module **/
import { patch } from "@web/core/utils/patch";
import PaymentForm from '@payment/js/payment_form';
import { _t } from '@web/core/l10n/translation';
import { rpc } from '@web/core/network/rpc';
/**
 * Handles the selection of a payment option in the payment form.
 *
 * This method overrides the default behavior to hide all delivery methods initially
 * and then show the delivery methods associated with the selected payment provider.
*/
PaymentForm.include({
    async _selectPaymentOption(ev) {
        this._super(...arguments);
        $('.delivery_method_list').each(function(key,carrier) {
            $(this).find('input[type="radio"]').prop('checked', false);
            $(this).addClass('d-none');
        });
        let providerId = ev.target.dataset['providerId']
        let carriers = await this.orm.read("payment.provider",[parseInt(providerId)],['delivery_carrier_ids'])
        if(carriers[0].delivery_carrier_ids.length > 0){
            carriers[0].delivery_carrier_ids.forEach((id)=>{
                if(id){
                    let deliveryMethod = '#delivery_method_'+id
                    let deliveryElement = $(deliveryMethod)[0];
                    // Only attempt to remove the class if the element exists
                    if (deliveryElement) {
                        deliveryElement.classList.remove('d-none');
                    }
                }
            });
        }else{
            let noShippingMethodElement = $('#NoShippingMethod')[0];
            // Only attempt to remove the class if the element exists
            if (noShippingMethodElement) {
                noShippingMethodElement.classList.remove('d-none');
            }
        }
    },
});
