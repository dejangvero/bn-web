import React, { Component } from "react";
import PropTypes from "prop-types";
import { Typography, withStyles } from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import Bigneon from "../../../../../../helpers/bigneon";
import notifications from "../../../../../../stores/notifications";
import CheckBox from "../../../../../elements/form/CheckBox";
import { fontFamilyBold, fontFamilyDemiBold } from "../../../../../../config/theme";
import Loader from "../../../../../elements/loaders/Loader";

const styles = theme => ({
	root: {
		backgroundColor: "#FFFFFF"
	},
	row: {
		borderStyle: "solid",
		height: theme.spacing.unit * 10
	},
	titleContainer: {
		marginBottom: theme.spacing.unit * 2,
		textAlign: "center"
	},
	eventName: {
		fontSize: theme.typography.fontSize * 2,
		fontFamily: fontFamilyBold
	},
	subTitle: {
		fontSize: theme.typography.fontSize * 1.5,
		fontFamily: fontFamilyDemiBold
	}
});

class Export extends Component {
	constructor(props) {
		super(props);

		this.state = { guests: null, holds: null, event: null };
	}

	componentDidMount() {
		const eventId = this.props.match.params.id;

		this.refreshEventDetails(eventId);
		this.refreshGuests(eventId);
		this.refreshHolds(eventId);
	}

	refreshEventDetails(id) {
		Bigneon()
			.events.read({ id })
			.then(response => {
				this.setState({ event: response.data });
			})
			.catch(error => {
				console.error(error);

				notifications.showFromErrorResponse({
					defaultMessage: "Loading event details failed.",
					error
				});
			});
	}

	refreshGuests(event_id) {
		Bigneon()
			.events.guests.index({ event_id, query: "" })
			.then(response => {
				const { data, paging } = response.data; //@TODO Implement pagination
				const guests = {};

				data.forEach(
					({
						 user_id,
						 email,
						 first_name,
						 last_name,
						 phone,
						 ticket_type,
						 status,
						 order_id,
						 ...ticketDetails
					 }) => {
						const key = `${user_id}_${order_id}_${ticket_type}`; //Filter by user and ticket type

						if (!guests[key]) {
							guests[key] = {
								email,
								first_name,
								last_name,
								phone,
								ticket_type,
								status,
								order_id,
								qtyRedeemed: status === "Redeemed" ? 1 : 0,
								tickets: [ticketDetails]
							};
						} else {
							guests[key].tickets.push({
								ticketDetails
							});

							if (status === "Redeemed") {
								guests[key].qtyRedeemed = guests[key].qtyRedeemed + 1;
							}
						}
					}
				);

				this.setState({ guests });
			})
			.catch(error => {
				console.error(error);

				notifications.showFromErrorResponse({
					defaultMessage: "Loading guests failed.",
					error
				});
			});
	}

	refreshHolds(event_id) {
		Bigneon()
			.events.holds.index({ event_id })
			.then(response => {
				const { data } = response.data;

				const holds = {};
				data.forEach(({ id, ...hold }) => {
					holds[id] = hold;
				});

				this.setState({ holds });
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Loading ticket holds failed."
				});
			});
	}

	renderTitle() {
		const { event } = this.state;
		const { classes } = this.props;

		if (!event) {
			return null;
		}

		const { name, venue } = event;

		return (
			<div className={classes.titleContainer}>
				<Typography className={classes.eventName}>{name}</Typography>
				<Typography className={classes.subTitle}>{venue.name}</Typography>
			</div>
		);
	}

	renderGuests() {
		const { guests } = this.state;
		const { classes } = this.props;

		if (guests === null) {
			return <Loader>Loading guests...</Loader>;
		}

		return (
			<Table>
				<TableHead>
					<TableRow>
						<TableCell>&nbsp;</TableCell>
						<TableCell align="right">Last name</TableCell>
						<TableCell align="right">First name</TableCell>
						<TableCell align="right">Qty available</TableCell>
						<TableCell align="right">Qty used</TableCell>
						<TableCell align="right">Ticket type</TableCell>
						<TableCell align="right">Order number</TableCell>
						<TableCell align="right">Payment status</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{Object.keys(guests).map(id => {
						const { first_name, last_name, tickets, order_id, qtyRedeemed, status, ticket_type } = guests[id];

						return (
							<TableRow key={id} className={classes.row}>
								<TableCell><CheckBox active={false}/></TableCell>
								<TableCell>{last_name || "-"}</TableCell>
								<TableCell>{first_name || "-"}</TableCell>
								<TableCell>{tickets.length - qtyRedeemed}</TableCell>
								<TableCell>{qtyRedeemed}</TableCell>
								<TableCell>{ticket_type}</TableCell>
								<TableCell>{order_id.slice(-8)}</TableCell>
								<TableCell>{status}</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		);
	}

	renderHolds() {
		const { holds } = this.state;
		const { classes } = this.props;

		if (holds === null) {
			return <Loader>Loading holds...</Loader>;
		}

		return (
			<Table>
				<TableHead>
					<TableRow>
						<TableCell>&nbsp;</TableCell>
						<TableCell align="right">Name</TableCell>
						<TableCell align="right">Type</TableCell>
						<TableCell align="right">Qty available</TableCell>
						<TableCell align="right">Qty used</TableCell>
						{/*<TableCell align="right">Ticket type</TableCell>*/}
						<TableCell align="right">Discount</TableCell>
						<TableCell align="right">Redemption code</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{Object.keys(holds).map(id => {
						const { name, hold_type, quantity, available, ticket_type_id, discount_in_cents, redemption_code } = holds[id];

						return (
							<TableRow key={id} className={classes.row}>
								<TableCell><CheckBox active={false}/></TableCell>
								<TableCell>{name || "-"}</TableCell>
								<TableCell>{hold_type}</TableCell>
								<TableCell>{available}</TableCell>
								<TableCell>{quantity - available}</TableCell>
								{/*<TableCell>{ticket_type_id.slice(4)}</TableCell>*/}
								<TableCell>{discount_in_cents ? `$${(discount_in_cents / 100).toFixed(2)}` : "Free"}</TableCell>
								<TableCell>{redemption_code}</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		);
	}

	render() {
		const { guests } = this.state;
		const { classes } = this.props;

		return (
			<div className={classes.root}>
				{this.renderTitle()}
				{this.renderGuests()}
				<br/><br/><br/>
				<div className={classes.titleContainer}>
					<Typography className={classes.subTitle}>Holds</Typography>
				</div>
				{this.renderHolds()}
			</div>
		);
	}
}

Export.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Export);
