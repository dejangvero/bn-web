import React from "react";
import { observer } from "mobx-react";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { Link } from "react-router-dom";

import SearchResultEventCard from "./SearchResultEventCard";
import ResultsRegionFilter from "./ResultsRegionFilter";
import eventResults from "../../../../stores/eventResults";

const styles = theme => ({
	subHeading: {
		marginBottom: theme.spacing.unit
	}
});

const EventsList = ({ events }) => {
	return events.map(({ event, venue }) => {
		if (!event) {
			console.error("Not found: ");
			return null;
		}

		const { id, name, imgSrc, formattedEventDate } = event;
		const { city, state } = venue;
		return (
			<Grid item xs={12} sm={6} lg={4} key={id}>
				<Link style={{ textDecoration: "none" }} to={`/events/${id}`}>
					<SearchResultEventCard
						imgSrc={imgSrc}
						name={name}
						formattedEventDate={formattedEventDate}
						city={city}
						state={state}
					/>
				</Link>
			</Grid>
		);
	});
};

const Results = observer(props => {
	const { classes } = props;
	const events = eventResults.filteredEvents;
	let label = null;
	if (events === null) {
		label = "Searching for events...";
	} else if (events instanceof Array) {
		if (events.length > 0) {
			label = null;
		} else {
			//label = "No results found";
		}
	}

	return (
		<div>
			<ResultsRegionFilter />

			{label ? (
				<Typography
					variant="subheading"
					gutterBottom
					className={classes.subHeading}
				>
					{label}
				</Typography>
			) : null}

			<Grid container spacing={24}>
				{events ? <EventsList events={events} /> : null}
			</Grid>
		</div>
	);
});

export default withStyles(styles)(Results);
