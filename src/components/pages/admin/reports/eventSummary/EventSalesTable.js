import React from "react";
import PropTypes from "prop-types";
import { withStyles, Typography } from "@material-ui/core";
import { dollars } from "../../../../../helpers/money";
import EventSummaryRow from "./EventSummaryRow";

export const EVENT_SALES_HEADINGS = [
	"Ticket",
	"Price",
	"Online",
	"Box office",
	"Total sold",
	"Comps",
	"Total value"
];

const styles = theme => {
	return {
		root: {}
	};
};

const EventSalesTableView = props => {
	const {
		classes,
		salesTotals,
		eventSales
	} = props;

	const {
		totalSoldOnlineCount,
		totalBoxOfficeCount,
		totalSoldCount,
		totalCompsCount,
		totalGross = 0
	} = salesTotals;

	return (
		<div>
			<EventSummaryRow heading>{EVENT_SALES_HEADINGS}</EventSummaryRow>

			{Object.keys(eventSales).map((ticketId, index) => {
				const ticketSale = eventSales[ticketId];
				const { totals, sales, name } = ticketSale;

				const {
					totalSoldOnlineCount,
					totalBoxOfficeCount,
					totalCompsCount,
					totalSoldCount,
					totalGross
				} = totals;

				return (
					<div key={ticketId}>
						<EventSummaryRow ticketTypeRow gray={true}>
							{[
								name,
								" ",
								totalSoldOnlineCount,
								totalBoxOfficeCount,
								totalSoldCount,
								totalCompsCount,
								dollars(totalGross)
							]}
						</EventSummaryRow>

						{sales.map((pricePoint, priceIndex) => {
							const {
								ticket_pricing_name,
								hold_name,
								promo_redemption_code,
								ticket_pricing_price_in_cents,
								promo_code_discounted_ticket_price
							} = pricePoint;
							let rowName = ticket_pricing_name;
							if (hold_name) {
								rowName = (promo_redemption_code ? "Promo - " : "Hold - ") + hold_name;
							}
							const price = ticket_pricing_price_in_cents + promo_code_discounted_ticket_price;
							return (
								<EventSummaryRow key={priceIndex}>
									{[
										rowName,
										dollars(price),
										pricePoint.online_sale_count,
										pricePoint.box_office_sale_count,
										pricePoint.total_sold_count,
										pricePoint.comp_sale_count,
										dollars(pricePoint.total_sold_in_cents)
									]}
								</EventSummaryRow>
							);
						})}
					</div>
				);
			})}

			<EventSummaryRow ticketTypeRow total>
				{[
					"Total sales",
					" ",
					totalSoldOnlineCount,
					totalBoxOfficeCount,
					totalSoldCount,
					totalCompsCount,
					dollars(totalGross)
				]}
			</EventSummaryRow>
		</div>
	);
};

EventSalesTableView.propTypes = {
	classes: PropTypes.object.isRequired,
	salesTotals: PropTypes.object.isRequired,
	eventSales: PropTypes.object.isRequired

};

export const EventSalesTable = withStyles(styles)(EventSalesTableView);
