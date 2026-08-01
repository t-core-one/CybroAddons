# -*- coding: utf-8 -*-
#############################################################################
#
#    Cybrosys Technologies Pvt. Ltd.
#
#    Copyright (C) 2022-TODAY Cybrosys Technologies(<https://www.cybrosys.com>).
#    Author: odoo@cybrosys.com
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
from odoo import api, models, fields


class ResPartner(models.Model):
    _name = 'res.partner'
    _inherit = 'res.partner'
    partner_credit = fields.Monetary(compute='credit_debit_get',
                                     string='Total Receivable',
                                     help="Total amount this customer owes you.")
    partner_debit = fields.Monetary(compute='credit_debit_get',
                                    string='Total Payable',
                                    help=
                                    "Total amount you have to pay to this vendor.")

    @api.depends_context('company')
    def credit_debit_get(self):
        """
          Retrieve the total receivable and payable amounts from customers
          for the current company.

        PLANA fix (2026-07-31, found by the sporthero v15->v16 migration's
        record-read sweep). The vendor's 16.0 rewrite of this compute assigns to
        ``self`` instead of to the record the SQL row belongs to, and then *reads*
        ``self.partner_debit`` / ``self.partner_credit``. On any multi-record
        recordset that read raises::

            ValueError: Expected singleton: res.partner(45, 14443, 9814, …)

        which breaks every batched read of these fields — a Contacts list with the
        column enabled, an export, and (because ``3c`` exposes them on
        ``sale.order`` as related fields) any sale-order list that shows them.
        Assigning to ``self`` also meant the *first* SQL row overwrote the value
        for every partner in the batch, so even the single-record path returned
        another partner's figures whenever more than one was computed at once.

        The v15 version of this module assigned per record (``partner.partner_credit
        = val``) and did not read the fields back, so this is a regression the
        vendor introduced in their 16.0 build, not a migration artifact.

        Rewritten to: seed both fields to 0 for the whole set (a compute must
        assign every record), then set only the record each SQL row is for. This
        also drops the vendor's habit of blanking the *opposite* field, so a
        partner that is both a customer and a vendor now shows both totals.
        """
        self.partner_credit = 0.0
        self.partner_debit = 0.0
        if not self.ids:
            return
        tables, where_clause, where_params = self.env['account.move.line']._where_calc(
            [('parent_state', '=', 'posted'),
             ('company_id', '=', self.env.company.id)]).get_sql()
        where_params = [tuple(self.ids)] + where_params
        if where_clause:
            where_clause = 'AND ' + where_clause
        self._cr.execute("""SELECT account_move_line.partner_id, a.account_type,
                      SUM(account_move_line.amount_residual) AS total
                      FROM """ + tables + """
                      LEFT JOIN account_account a ON
                      (account_move_line.account_id=a.id)
                      WHERE a.account_type IN
                      ('asset_receivable','liability_payable')
                      AND account_move_line.partner_id IN %s
                      AND account_move_line.reconciled IS FALSE
                      """ + where_clause + """
                      GROUP BY account_move_line.partner_id, a.account_type
                      """, where_params)
        for partner_id, account_type, total in self._cr.fetchall():
            partner = self.browse(partner_id)
            if account_type == 'asset_receivable':
                partner.partner_credit = total
            elif account_type == 'liability_payable':
                partner.partner_debit = -total
