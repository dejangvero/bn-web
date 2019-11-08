import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import classNames from "classnames";
import Bigneon from "../../../../../../helpers/bigneon";
import user from "../../../../../../stores/user";
import Loader from "../../../../../elements/loaders/Loader";
import SelectGroup from "../../../../../common/form/SelectGroup";
import Button from "../../../../../elements/Button";
import { FacebookButton } from "../../../../authentication/social/FacebookButton";
import { Grid, Divider } from "@material-ui/core";
import notification from "../../../../../../stores/notifications";
import InputGroup from "../../../../../common/form/InputGroup";
import {
	fontFamilyBold,
	fontFamilyDemiBold,
	secondaryHex
} from "../../../../../../config/theme";

const styles = theme => ({
	root: {},
	heading: {
		fontSize: 24,
		fontFamily: fontFamilyDemiBold,
		[theme.breakpoints.down("sm")]: {
			fontSize: theme.typography.fontSize * 2.9,
			paddingLeft: theme.spacing.unit * 3,
			paddingRight: theme.spacing.unit * 3
		}
	},
	pinkSpan: {
		color: secondaryHex
	},
	demiBoldSpan: {
		fontFamily: fontFamilyDemiBold
	},
	text: {},
	smallHeading: {
		fontSize: 20,
		fontFamily: fontFamilyDemiBold
	},
	numberPoint: {
		borderRadius: "50%",
		backgroundColor: "rgba(255, 32, 177, .12)",
		marginRight: theme.spacing.unit * 2,
		minWidth: 30,
		minHeight: 30,
		display: "flex",
		alignItems: "center",
		justifyContent: "center"
	},
	pointText: {
		color: secondaryHex,
		lineHeight: "27px",
		marginTop: 3
	},
	noteList: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "flex-start",
		marginTop: theme.spacing.unit * 2,
		alignItems: "flex-start"
	},
	capTitleSmall: {
		textTransform: "uppercase",
		fontFamily: fontFamilyDemiBold,
		fontSize: 14
	},
	inputStyle: {
		borderRadius: 10,
		display: "flex",
		width: "100%",
		padding: theme.spacing.unit,
		marginTop: theme.spacing.unit,
		marginBottom: theme.spacing.unit * 2,
		border: "1px solid #8080802e",
		fontSize: 19,
		color: "#9DA3B4",
		outline: "none"
	},
	inputLabel: {
		fontSize: 18,
		fontFamily: fontFamilyDemiBold
	}
});

function htmlToPlainText(s) {
	const span = document.createElement("span");
	span.innerHTML = s;
	return span.textContent || span.innerText;
}

class FacebookEvents extends Component {
	constructor(props) {
		super(props);

		this.state = {
			eventName: null,
			pages: [],
			pageId: null,
			facebookCategory: "MUSIC_EVENT",
			isSubmitting: false,
			facebookEventId: null,
			isFacebookLinked: false,
			description: "",
			title: "",
			customAddress: null,
			locationType: "UsePageLocation",
			facebookResponseSuccess: null
		};
	}

	componentDidMount() {
		const { eventId } = this.props;

		this.refreshPages(true);
		Bigneon()
			.events.read({ id: eventId })
			.then(response => {
				this.setState({
					title: htmlToPlainText(response.data.name || ""),
					description: htmlToPlainText(response.data.additional_info || ""),
					customAddress: response.data.venue.address,
					facebookEventId: response.data.facebook_event_id
				});
			})
			.catch(error => {
				console.error(error);
			});
	}

	onFacebookLogin() {
		this.refreshPages();
	}

	refreshPages(ignoreErrors) {
		this.setState({ isSubmitting: true });
		Bigneon()
			.external.facebook.pages()
			.then(response =>
				this.setState({
					pages: response.data,
					isFacebookLinked: true,
					isSubmitting: false,
					pageId: response.data[0].id
				})
			)
			.catch(error => {
				if (!ignoreErrors) {
					const { message, type } = error;
					notification.show({
						message,
						variant: type === "validation_error" ? "warning" : "error"
					});
					this.setState({ isFacebookLinked: false, isSubmitting: false });
				}
			});
	}

	onSubmit() {
		const {
			pageId,
			facebookCategory,
			description,
			locationType,
			customAddress
		} = this.state;
		this.setState({ isSubmitting: true });
		Bigneon()
			.external.facebook.createEvent({
				event_id: this.props.eventId,
				page_id: pageId,
				category: facebookCategory,
				description,
				location_type: locationType,
				custom_address: customAddress ? customAddress : null
			})
			.then(response => {
				this.setState({
					isSubmitting: false,
					isFacebookLinked: true,
					facebookEventId: response.data.facebook_event_id,
					facebookResponseSuccess: true
				});
				notification.show({
					message: "Event published to Facebook",
					variant: "success"
				});
			})
			.catch(error => {
				let { message } = error;
				const { type } = error;
				if (
					error.response &&
					error.response.data &&
					error.response.data.error
				) {
					message = error.response.data.error;
				}
				notification.show({
					message,
					variant: type === "validation_error" ? "warning" : "error"
				});
				this.setState({ isSubmitting: false });
			});
	}

	render() {
		const {
			pages,
			pageId,
			facebookCategory,
			isSubmitting,
			isFacebookLinked,
			facebookResponseSuccess,
			facebookEventId,
			title,
			description
		} = this.state;

		const { classes } = this.props;

		return (
			<div>
				<Grid container justify={"space-between"}>
					<Grid item xs={12} sm={12} md={12} lg={12}>
						<Typography
							className={classNames({
								[classes.pinkSpan]: true,
								[classes.capTitleSmall]: true
							})}
						>
							marketing
						</Typography>
					</Grid>
					<Grid item xs={12} sm={6} md={5} lg={5}>
						<Typography className={classes.heading}>
							Create this Event on Facebook
						</Typography>
						<Typography>
							Increase your event's reach by{" "}
							<span
								className={classNames({
									[classes.pinkSpan]: true,
									[classes.demiBoldSpan]: true
								})}
							>
								creating a Facebook event
							</span>
							. It's easy!
						</Typography>
					</Grid>

					<Grid item xs={12} sm={12} md={6} lg={6}>
						<Typography className={classes.smallHeading}>
							Please note:
						</Typography>

						<div className={classes.noteList}>
							<div className={classes.numberPoint}>
								<Typography className={classes.pointText}>1</Typography>
							</div>
							<Typography>
								A Facebook user with admin access to your Facebook page needs to
								give Big Neon permission to create the event.
							</Typography>
						</div>
						<div className={classes.noteList}>
							<div className={classes.numberPoint}>
								<Typography className={classes.pointText}>2</Typography>
							</div>
							<Typography>
								Don't worry, we won't create the event until you review the
								settings and publish the event.
							</Typography>
						</div>
						<div className={classes.noteList}>
							<div className={classes.numberPoint}>
								<Typography className={classes.pointText}>3</Typography>
							</div>
							<Typography>
								You must have set up a street address on your Facebook page to
								use it as a location
							</Typography>
						</div>
					</Grid>
					<Grid item xs={12} sm={12} md={12} lg={12}>
						<Divider style={{ marginTop: 20, marginBottom: 40 }}/>
					</Grid>
					<Grid item xs={12} sm={12} md={5} lg={5}>
						{isFacebookLinked ? (
							<div>
								<p>Select Facebook Page</p>
								{pages ? (
									<SelectGroup
										items={pages.map(page => ({
											value: page.id,
											name: page.name
										}))}
										value={pageId}
										name="pageId"
										onChange={e => this.setState({ pageId: e.target.value })}
									/>
								) : (
									<span>Loading pages</span>
								)}
								<form action="">
									<Typography className={classes.inputLabel}>
										Facebook title <span className={classes.pinkSpan}>*</span>
									</Typography>
									<input
										value={title}
										name="title "
										className={classes.inputStyle}
										type="text"
										onChange={e => this.setState({ title: e.target.value })}
									/>
									<Typography className={classes.inputLabel}>
										Description <span className={classes.pinkSpan}>*</span>
									</Typography>
									<textarea
										value={description}
										name="description"
										className={classes.inputStyle}
										style={{ height: 200 }}
										onChange={e =>
											this.setState({ description: e.target.value })
										}
									/>
									<Typography className={classes.inputLabel}>
										Facebook Event Category
									</Typography>
									<SelectGroup
										items={[{ value: "MUSIC_EVENT", name: "Music Event" }]}
										value={this.state.facebookCategory}
										name="facebookCategory"
										onChange={e =>
											this.setState({ facebookCategory: e.target.value })
										}
									/>
								</form>
								{facebookEventId || facebookResponseSuccess ? (
									<a
										target="_blank"
										href={`https://www.facebook.com/${facebookEventId}`}
									>
										<Button
											size="large"
											type="submit"
											variant="callToAction"
											disabled={isSubmitting}
										>
											View on Facebook
										</Button>
									</a>
								) : (
									<Button
										size="large"
										type="submit"
										variant="callToAction"
										onClick={this.onSubmit.bind(this)}
										disabled={isSubmitting}
									>
										Add event to Facebook
									</Button>
								)}
							</div>
						) : (
							<div>
								<FacebookButton
									scopes={["manage_pages"]}
									linkToUser={true}
									onSuccess={this.onFacebookLogin.bind(this)}
								/>
							</div>
						)}
					</Grid>
				</Grid>
			</div>
		);
	}
}

FacebookEvents.propTypes = {
	classes: PropTypes.object.isRequired,
	eventId: PropTypes.string.isRequired
};

export default withStyles(styles)(FacebookEvents);
