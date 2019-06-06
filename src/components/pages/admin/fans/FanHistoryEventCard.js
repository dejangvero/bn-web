import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles, Typography, Collapse } from "@material-ui/core";

import moment from "moment";
import Card from "../../../elements/Card";
import { fontFamilyDemiBold, secondaryHex } from "../../../../config/theme";
import Loader from "../../../elements/loaders/Loader";
import Grid from "@material-ui/core/Grid";
import FanHistoryActivityCard from "./FanHistoryActivityCard";
import servedImage from "../../../../helpers/imagePathHelper";

const styles = theme => ({
	root: {
		marginTop: theme.spacing.unit
	},
	card: { padding: theme.spacing.unit * 2 },
	greySubtitle: {
		color: "#9DA3B4",
		fontSize: theme.typography.fontSize * 0.9
	},
	boldSpan: {
		fontFamily: fontFamilyDemiBold
	},
	linkText: {
		color: secondaryHex,
		fontFamily: fontFamilyDemiBold
	},
	verticalDividerSmall: {
		borderLeft: "1px solid #DEE2E8",
		height: 20,
		marginLeft: 15,
		marginRight: 15
	},
	bold: {
		fontFamily: fontFamilyDemiBold
	},
	bottomRow: {
		display: "flex"
	},
	showHide: {
		color: secondaryHex
	},
	showHideRow: {
		display: "flex",
		flexDirection: "row",
		cursor: "pointer",
		paddingTop: theme.spacing.unit * 2
	},
	showHideIcon: {
		paddingLeft: theme.spacing.unit,
		paddingBottom: theme.spacing.unit / 2
	}
});

class FanHistoryEventCard extends Component {
	constructor(props) {
		super(props);

		this.state = {
			// profile: null,
			expandedRowKey: null
		};
		this.onExpandChange = this.onExpandChange.bind(this);
	}

	onExpandChange(expandedRowKey) {
		if (expandedRowKey === this.state.expandedRowKey) {
			this.setState({
				expandedRowKey: null
			});
		} else {
			this.setState({ expandedRowKey });
		}
	}

	renderActivities() {
		const { expandedRowKey } = this.state;
		const { event_history } = this.props;
		if (event_history === null) {
			return <Loader>Loading history...</Loader>;
		}

		return event_history.map((item, index) => {
			const expanded = expandedRowKey === index;
			return (
				<FanHistoryActivityCard
					onExpandChange={() => this.onExpandChange(index)}
					expanded={expanded}
					key={index}
					{...item}
				/>
			);
		});
	}

	render() {
		const {
			order_date,
			event_name,
			event_loc,
			event_start,
			event_id,
			event_history,
			onExpandChange,
			expanded,
			classes
		} = this.props;

		return (
			<div className={classes.root}>
				<Card onClick={onExpandChange}>
					<div className={classes.card}>
						<Typography>
							<span className={classes.boldSpan}>{event_name}</span>
						</Typography>
						<Typography className={classes.greySubtitle}>
							{moment(event_start).format("M/D/Y hh:mmA")}
						</Typography>
						<Typography className={classes.greySubtitle}>
							{event_loc}
						</Typography>
						{!expanded ? (
							<div className={classes.showHideRow}>
								<Typography className={classes.showHide}>
									Show all details
								</Typography>
								<img
									className={classes.showHideIcon}
									src={servedImage("/icons/down-active.svg")}
								/>
							</div>
						) : (
							<div className={classes.showHideRow}>
								<Typography className={classes.showHide}>
									Hide details
								</Typography>
								<img
									className={classes.showHideIcon}
									src={servedImage("/icons/up-active.svg")}
								/>
							</div>
						)}
					</div>
				</Card>
				<Collapse in={expanded}>
					<div>
						<Grid
							item
							xs={12}
							sm={12}
							md={12}
							lg={12}
							style={{ paddingTop: 20 }}
						>
							{this.renderActivities()}
						</Grid>
					</div>
				</Collapse>
			</div>
		);
	}
}
FanHistoryEventCard.propTypes = {
	order_date: PropTypes.string,
	event_start: PropTypes.string,
	ticket_sales: PropTypes.number,
	event_name: PropTypes.string.isRequired,
	event_id: PropTypes.string,
	revenue_in_cents: PropTypes.number,
	order_id: PropTypes.string,
	event_loc: PropTypes.string,
	onExpandChange: PropTypes.func.isRequired,
	expanded: PropTypes.bool.isRequired,
	event_history: PropTypes.array
};
export default withStyles(styles)(FanHistoryEventCard);
