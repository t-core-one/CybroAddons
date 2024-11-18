# -*- coding: utf-8 -*-
#############################################################################
#
#    Cybrosys Technologies Pvt. Ltd.
#
#    Copyright (C) 2024-TODAY Cybrosys Technologies(<https://www.cybrosys.com>)
#    Author: Cybrosys Techno Solutions(<https://www.cybrosys.com>)
#
#    You can modify it under the terms of the GNU AFFERO
#    GENERAL PUBLIC LICENSE (AGPL v3), Version 3.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU AFFERO GENERAL PUBLIC LICENSE (AGPL v3) for more details.
#
#    You should have received a copy of the GNU AFFERO GENERAL PUBLIC LICENSE
#    (AGPL v3) along with this program.
#    If not, see <http://www.gnu.org/licenses/>.
#
#############################################################################
import json
from odoo import http
from odoo.http import request,route
from odoo.addons.website_sale.controllers.product_configurator import WebsiteSaleProductConfiguratorController

class WebsiteSaleDecimal(WebsiteSaleProductConfiguratorController):

    @route()
    def website_sale_product_configurator_update_cart(
            self, main_product, optional_products, **kwargs):
        """ Add the provided main and optional products to the cart.

        Main and optional products have the following shape:
        ```
        {
            'product_id': int,
            'product_template_id': int,
            'parent_product_template_id': int,
            'quantity': float,
            'product_custom_attribute_values': list(dict),
            'no_variant_attribute_value_ids': list(int),
        }
        ```

        Note: if product A is a parent of product B, then product A must come before product B in
        the optional_products list. Otherwise, the corresponding order lines won't be linked.

        :param dict main_product: The main product to add.
        :param list(dict) optional_products: The optional products to add.
        :param dict kwargs: Locally unused data passed to `_cart_update`.
        :rtype: dict
        :return: A dict containing information about the cart update.
        """
        order_sudo = request.website.sale_get_order(force_create=True)
        if order_sudo.state != 'draft':
            request.session['sale_order_id'] = None
            order_sudo = request.website.sale_get_order(force_create=True)
        values = order_sudo._cart_update(
            product_id=main_product['product_id'],
            add_qty=float(main_product['quantity']),  # Ensure quantity is float
            product_custom_attribute_values=main_product['product_custom_attribute_values'],
            no_variant_attribute_value_ids=[
                int(value_id) for value_id in main_product['no_variant_attribute_value_ids']
            ],
            **kwargs,
        )
        line_ids = {main_product['product_template_id']: values['line_id']}

        if optional_products and values['line_id']:
            for option in optional_products:
                option_values = order_sudo._cart_update(
                    product_id=option['product_id'],
                    add_qty=float(option['quantity']),  # Ensure quantity is float
                    product_custom_attribute_values=option['product_custom_attribute_values'],
                    no_variant_attribute_value_ids=[
                        int(value_id) for value_id in option['no_variant_attribute_value_ids']
                    ],
                    linked_line_id=line_ids[option['parent_product_template_id']],
                    **kwargs,
                )
                line_ids[option['product_template_id']] = option_values['line_id']

        values['notification_info'] = self._get_cart_notification_information(
            order_sudo, line_ids.values()
        )
        values['cart_quantity'] = order_sudo.cart_quantity
        request.session['website_sale_cart_quantity'] = order_sudo.cart_quantity
        return values