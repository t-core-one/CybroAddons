# -*- coding: utf-8 -*-
#############################################################################
#
#    Cybrosys Technologies Pvt. Ltd.
#
#    Copyright (C) 2024-TODAY Cybrosys Technologies(<https://www.cybrosys.com>).
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
import re
from odoo import http
from odoo.http import request
from odoo.addons.website_sale.controllers.main import WebsiteSale
from odoo.addons.website_sale.controllers.product_configurator import (
    WebsiteSaleProductConfiguratorController,
)


class WebsiteProductCustomization(WebsiteSale):
    """
    Inheriting 'WebsiteSale' class from 'website_sale.controllers.main' to
    modify the method 'cart_update_json'.
    """

    @http.route()
    def cart_update_json(
        self,
        product_id,
        design_image=None,
        line_id=None,
        add_qty=None,
        set_qty=None,
        display=True,
        product_custom_attribute_values=None,
        no_variant_attribute_values=None,
        **kw
    ):
        """
        This route is called :
            - When changing quantity from the cart.
            - When adding a product from the wishlist.
            - When adding a product to cart on the same page
             (without redirection).
        """
        res = super(WebsiteProductCustomization, self).cart_update_json(
            product_id=product_id,
            design_image=design_image,
            line_id=line_id,
            add_qty=add_qty,
            set_qty=set_qty,
            display=display,
            product_custom_attribute_values=product_custom_attribute_values,
            no_variant_attribute_values=no_variant_attribute_values,
            **kw
        )
        order = request.website.sale_get_order(force_create=True)
        if design_image:
            for record in order.order_line:
                if record.id == res["line_id"]:
                    record.product_design = str(
                        re.sub("^data:image\/\w+;base64,", "", design_image),
                    )
                    record.is_customized_product = True
        else:
            if not order.order_line.browse(res["line_id"]).product_design:
                order.order_line.browse(res["line_id"]).product_design = (
                    request.env["product.product"].sudo().browse(product_id).image_1920
                )
        request.session["website_sale_cart_quantity"] = order.cart_quantity
        return res


class WebsiteSaleStockProductConfiguratorController(
        WebsiteSaleProductConfiguratorController):

    """
    Inheriting 'WebsiteSale' class from to modify the method
    'cart_options_update_json'.
    """

    @http.route()
    def website_sale_product_configurator_update_cart(
            self, main_product, optional_products, **kwargs
    ):
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

        # The main product could theoretically have a parent, but we ignore it to avoid
        # circularities in the linked line ids.

        design_image = (
            main_product[
                "design_image"] if "design_image" in main_product else None
        )

        values = order_sudo._cart_update(
            product_id=main_product['product_id'],
            add_qty=main_product['quantity'],
            product_custom_attribute_values=main_product[
                'product_custom_attribute_values'],
            no_variant_attribute_value_ids=[
                int(value_id) for value_id in
                main_product['no_variant_attribute_value_ids']
            ],
            design_image=design_image,
            **kwargs,
        )
        line_ids = {main_product['product_template_id']: values['line_id']}

        if optional_products and values['line_id']:
            for option in optional_products:
                option_values = order_sudo._cart_update(
                    product_id=option['product_id'],
                    add_qty=option['quantity'],
                    product_custom_attribute_values=option[
                        'product_custom_attribute_values'],
                    no_variant_attribute_value_ids=[
                        int(value_id) for value_id in
                        option['no_variant_attribute_value_ids']
                    ],
                    # Using `line_ids[...]` instead of `line_ids.get(...)` ensures that this throws
                    # if an optional product contains bad data.
                    linked_line_id=line_ids[
                        option['parent_product_template_id']],
                    design_image=design_image,
                    **kwargs,
                )
                line_ids[option['product_template_id']] = option_values[
                    'line_id']
                for record in order_sudo.order_line:
                    if record.id == option_values["line_id"]:
                        record.product_design = (
                            request.env["product.product"]
                            .sudo()
                            .browse(option["product_id"])
                            .image_1920
                        )
        if design_image:
            for record in order_sudo.order_line:
                if record.id == values["line_id"]:
                    record.product_design = str(
                        re.sub(
                            "^data:image\/\w+;base64,",
                            "",
                            main_product["design_image"],
                        ),
                    )
                    record.is_customized_product = True
        else:
            if not order_sudo.order_line.browse(values["line_id"]).product_design:
                order_sudo.order_line.browse(values["line_id"]).product_design = (
                    request.env["product.product"]
                    .sudo()
                    .browse(main_product["product_id"])
                    .image_1920
                )

        values['notification_info'] = self._get_cart_notification_information(
            order_sudo, line_ids.values()
        )
        values['cart_quantity'] = order_sudo.cart_quantity
        request.session['website_sale_cart_quantity'] = order_sudo.cart_quantity

        return values
