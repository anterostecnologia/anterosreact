//https://github.com/fortana-co/react-dropzone-uploader

import React from "react";
import PropTypes from "prop-types";

const formatBytes = b => {
	const units = ["bytes", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
	let l = 0;
	let n = b;

	while (n >= 1024) {
		n /= 1024;
		l += 1;
	}

	return `${n.toFixed(n >= 10 || l < 1 ? 0 : 1)}${units[l]}`;
};

const formatDuration = seconds => {
	const date = new Date(null);
	date.setSeconds(seconds);
	const dateString = date.toISOString().slice(11, 19);
	if (seconds < 3600) return dateString.slice(3);
	return dateString;
};

// adapted from: https://github.com/okonet/attr-accept/blob/master/src/index.js
// returns true if file.name is empty and accept string is something like ".csv",
// because file comes from dataTransferItem for drag events, and
// dataTransferItem.name is always empty
const accepts = (file, accept) => {
	if (!accept || accept === "*") return true;

	const mimeType = file.type || "";
	const baseMimeType = mimeType.replace(/\/.*$/, "");

	return accept
		.split(",")
		.map(t => t.trim())
		.some(type => {
			if (type.charAt(0) === ".") {
				return (
					file.name === undefined ||
					file.name.toLowerCase().endsWith(type.toLowerCase())
				);
			} else if (type.endsWith("/*")) {
				// this is something like an image/* mime type
				return baseMimeType === type.replace(/\/.*$/, "");
			}
			return mimeType === type;
		});
};

const resolveValue = (value, ...args) => {
	if (typeof value === "function") return value(...args);
	return value;
};

const defaultClassNames = {
	dropzone: "dropzone-dropzone",
	dropzoneActive: "dropzone-dropzoneActive",
	dropzoneReject: "dropzone-dropzoneActive",
	dropzoneDisabled: "dropzone-dropzoneDisabled",
	input: "dropzone-input",
	inputLabel: "dropzone-inputLabel",
	inputLabelWithFiles: "dropzone-inputLabelWithFiles",
	preview: "dropzone-previewContainer",
	previewImage: "dropzone-previewImage",
	submitButtonContainer: "dropzone-submitButtonContainer",
	submitButton: "dropzone-submitButton"
};

const mergeStyles = (classNames, styles, addClassNames, ...args) => {
	const resolvedClassNames = { ...defaultClassNames };
	const resolvedStyles = { ...styles };

	for (const key of Object.keys(classNames)) {
		resolvedClassNames[key] = resolveValue(classNames[key], ...args);
	}

	for (const key of Object.keys(addClassNames)) {
		resolvedClassNames[key] = `${resolvedClassNames[key]} ${resolveValue(
			addClassNames[key],
			...args
		)}`;
	}

	for (const key of Object.keys(styles)) {
		resolvedStyles[key] = resolveValue(styles[key], ...args);
	}

	return { classNames: resolvedClassNames, styles: resolvedStyles };
};

const getFilesFromEvent = event => {
	let items = [];
	if (event.dataTransfer) {
		const dt = event.dataTransfer;

		// NOTE: Only the 'drop' event has access to DataTransfer.files, otherwise it will always be empty
		if (dt.files && dt.files.length) {
			items = dt.files;
		} else if (dt.items && dt.items.length) {
			items = dt.items;
		}
	} else if (event.target && event.target.files) {
		items = event.target.files;
	}

	return Array.prototype.slice.call(items);
};

const SubmitButton = props => {
	const {
		className,
		buttonClassName,
		style,
		buttonStyle,
		disabled,
		content,
		onSubmit,
		files
	} = props;

	const _disabled =
		files.some(f =>
			["preparing", "getting_upload_params", "uploading"].includes(
				f.meta.status
			)
		) || !files.some(f => ["headers_received", "done"].includes(f.meta.status));

	const handleSubmit = () => {
		onSubmit(
			files.filter(f => ["headers_received", "done"].includes(f.meta.status))
		);
	};

	return (
		<div className={className} style={style}>
			<button
				className={buttonClassName}
				style={buttonStyle}
				onClick={handleSubmit}
				disabled={disabled || _disabled}
			>
				{content}
			</button>
		</div>
	);
};

SubmitButton.propTypes = {
	className: PropTypes.string,
	buttonClassName: PropTypes.string,
	style: PropTypes.object,
	buttonStyle: PropTypes.object,
	disabled: PropTypes.bool.isRequired,
	content: PropTypes.node,
	onSubmit: PropTypes.func.isRequired,
	files: PropTypes.arrayOf(PropTypes.object).isRequired,
	extra: PropTypes.shape({
		active: PropTypes.bool.isRequired,
		reject: PropTypes.bool.isRequired,
		dragged: PropTypes.arrayOf(PropTypes.any).isRequired,
		accept: PropTypes.string.isRequired,
		multiple: PropTypes.bool.isRequired,
		minSizeBytes: PropTypes.number.isRequired,
		maxSizeBytes: PropTypes.number.isRequired,
		maxFiles: PropTypes.number.isRequired
	}).isRequired
};


class Preview extends React.PureComponent {
	render() {
		const {
			className,
			imageClassName,
			style,
			imageStyle,
			fileWithMeta: { cancel, remove, restart },
			meta: {
				name = "",
				percent = 0,
				size = 0,
				previewUrl,
				status,
				duration,
				validationError
			},
			isUpload,
			canCancel,
			canRemove,
			canRestart,
			extra: { minSizeBytes }
		} = this.props;

		let title = `${name || "?"}, ${formatBytes(size)}`;
		if (duration) title = `${title}, ${formatDuration(duration)}`;

		if (status === "error_file_size" || status === "error_validation") {
			return (
				<div className={className} style={style}>
					<span className="dropzone-previewFileNameError">{title}</span>
					{status === "error_file_size" && (
						<span>
							{size < minSizeBytes ? "File too small" : "File too big"}
						</span>
					)}
					{status === "error_validation" && (
						<span>{String(validationError)}</span>
					)}
					{canRemove && (
						<span
							className="dropzone-previewButton fal fa-trash-alt"
							onClick={remove}
						/>
					)}
				</div>
			);
		}

		if (
			status === "error_upload_params" ||
			status === "exception_upload" ||
			status === "error_upload"
		) {
			title = `${title} (upload failed)`;
		}
		if (status === "aborted") title = `${title} (cancelled)`;

		return (
			<div className={className} style={style}>
				{previewUrl && (
					<img
						className={imageClassName}
						style={imageStyle}
						src={previewUrl}
						alt={title}
						title={title}
					/>
				)}
				{!previewUrl && <span className="dropzone-previewFileName">{title}</span>}

				<div className="dropzone-previewStatusContainer">
					{isUpload && (
						<progress
							max={100}
							value={
								status === "done" || status === "headers_received"
									? 100
									: percent
							}
						/>
					)}

					{status === "uploading" && canCancel && (
						<span
							className="dropzone-previewButton fal fa-ban"
							onClick={cancel}
						/>
					)}
					{status !== "preparing" &&
						status !== "getting_upload_params" &&
						status !== "uploading" &&
						canRemove && (
							<span
								className="dropzone-previewButton fal fa-trash-alt"
								onClick={remove}
							/>
						)}
					{[
						"error_upload_params",
						"exception_upload",
						"error_upload",
						"aborted",
						"ready"
					].includes(status) &&
						canRestart && (
							<span
								className="dropzone-previewButton fal fa-eye"
								onClick={restart}
							/>
						)}
				</div>
			</div>
		);
	}
}

Preview.propTypes = {
	className: PropTypes.string,
	imageClassName: PropTypes.string,
	style: PropTypes.object,
	imageStyle: PropTypes.object,
	fileWithMeta: PropTypes.shape({
		file: PropTypes.any.isRequired,
		meta: PropTypes.object.isRequired,
		cancel: PropTypes.func.isRequired,
		restart: PropTypes.func.isRequired,
		remove: PropTypes.func.isRequired,
		xhr: PropTypes.any
	}).isRequired,
	// copy of fileWithMeta.meta, won't be mutated
	meta: PropTypes.shape({
		status: PropTypes.oneOf([
			"preparing",
			"error_file_size",
			"error_validation",
			"ready",
			"getting_upload_params",
			"error_upload_params",
			"uploading",
			"exception_upload",
			"aborted",
			"error_upload",
			"headers_received",
			"done"
		]).isRequired,
		type: PropTypes.string.isRequired,
		name: PropTypes.string,
		uploadedDate: PropTypes.string.isRequired,
		percent: PropTypes.number,
		size: PropTypes.number,
		lastModifiedDate: PropTypes.string,
		previewUrl: PropTypes.string,
		duration: PropTypes.number,
		width: PropTypes.number,
		height: PropTypes.number,
		videoWidth: PropTypes.number,
		videoHeight: PropTypes.number,
		validationError: PropTypes.any
	}).isRequired,
	isUpload: PropTypes.bool.isRequired,
	canCancel: PropTypes.bool.isRequired,
	canRemove: PropTypes.bool.isRequired,
	canRestart: PropTypes.bool.isRequired,
	files: PropTypes.arrayOf(PropTypes.any).isRequired, // eslint-disable-line react/no-unused-prop-types
	extra: PropTypes.shape({
		active: PropTypes.bool.isRequired,
		reject: PropTypes.bool.isRequired,
		dragged: PropTypes.arrayOf(PropTypes.any).isRequired,
		accept: PropTypes.string.isRequired,
		multiple: PropTypes.bool.isRequired,
		minSizeBytes: PropTypes.number.isRequired,
		maxSizeBytes: PropTypes.number.isRequired,
		maxFiles: PropTypes.number.isRequired
	}).isRequired
};

const Layout = props => {
	const {
		input,
		previews,
		submitButton,
		dropzoneProps,
		files,
		extra: { maxFiles }
	} = props;

	return (
		<div {...dropzoneProps}>
			{previews}

			{files.length < maxFiles && input}

			{files.length > 0 && submitButton}
		</div>
	);
};

Layout.propTypes = {
	input: PropTypes.node,
	previews: PropTypes.arrayOf(PropTypes.node),
	submitButton: PropTypes.node,
	dropzoneProps: PropTypes.shape({
		ref: PropTypes.any.isRequired,
		className: PropTypes.string.isRequired,
		style: PropTypes.object,
		onDragEnter: PropTypes.func.isRequired,
		onDragOver: PropTypes.func.isRequired,
		onDragLeave: PropTypes.func.isRequired,
		onDrop: PropTypes.func.isRequired
	}).isRequired,
	files: PropTypes.arrayOf(PropTypes.any).isRequired,
	extra: PropTypes.shape({
		active: PropTypes.bool.isRequired,
		reject: PropTypes.bool.isRequired,
		dragged: PropTypes.arrayOf(PropTypes.any).isRequired,
		accept: PropTypes.string.isRequired,
		multiple: PropTypes.bool.isRequired,
		minSizeBytes: PropTypes.number.isRequired,
		maxSizeBytes: PropTypes.number.isRequired,
		maxFiles: PropTypes.number.isRequired,
		onFiles: PropTypes.func.isRequired,
		onCancelFile: PropTypes.func.isRequired,
		onRemoveFile: PropTypes.func.isRequired,
		onRestartFile: PropTypes.func.isRequired
	}).isRequired
};

const Input = props => {
	const {
		className,
		labelClassName,
		labelWithFilesClassName,
		style,
		labelStyle,
		labelWithFilesStyle,
		getFilesFromEvent,
		accept,
		multiple,
		disabled,
		content,
		withFilesContent,
		onFiles,
		files
	} = props;

	return (
		<label
			className={files.length > 0 ? labelWithFilesClassName : labelClassName}
			style={files.length > 0 ? labelWithFilesStyle : labelStyle}
		>
			{files.length > 0 ? withFilesContent : content}
			<input
				className={className}
				style={style}
				type="file"
				accept={accept}
				multiple={multiple}
				disabled={disabled}
				onChange={async e => {
					const chosenFiles = await getFilesFromEvent(e);
					onFiles(chosenFiles);
					e.target.value = null;
				}}
			/>
		</label>
	);
};

Input.propTypes = {
	className: PropTypes.string,
	labelClassName: PropTypes.string,
	labelWithFilesClassName: PropTypes.string,
	style: PropTypes.object,
	labelStyle: PropTypes.object,
	labelWithFilesStyle: PropTypes.object,
	getFilesFromEvent: PropTypes.func.isRequired,
	accept: PropTypes.string.isRequired,
	multiple: PropTypes.bool.isRequired,
	disabled: PropTypes.bool.isRequired,
	content: PropTypes.node,
	withFilesContent: PropTypes.node,
	onFiles: PropTypes.func.isRequired,
	files: PropTypes.arrayOf(PropTypes.any).isRequired,
	extra: PropTypes.shape({
		active: PropTypes.bool.isRequired,
		reject: PropTypes.bool.isRequired,
		dragged: PropTypes.arrayOf(PropTypes.any).isRequired,
		accept: PropTypes.string.isRequired,
		multiple: PropTypes.bool.isRequired,
		minSizeBytes: PropTypes.number.isRequired,
		maxSizeBytes: PropTypes.number.isRequired,
		maxFiles: PropTypes.number.isRequired
	}).isRequired
};

class AnterosDropzone extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			active: false,
			dragged: []
		};
		this._files = []; // fileWithMeta objects: { file, meta }
		this._mounted = true;
		this._dropzone = React.createRef();
	}

	componentDidMount() {
		if (this.props.initialFiles) this.handleFiles(this.props.initialFiles);
	}

	componentWillUnmount() {
		this._mounted = false;
		for (const fileWithMeta of this._files) this.handleCancel(fileWithMeta);
	}

	_forceUpdate = () => {
		if (this._mounted) this.forceUpdate();
	};

	getFilesFromEvent = () => {
		return this.props.getFilesFromEvent || getFilesFromEvent;
	};

	getDataTransferItemsFromEvent = () => {
		return this.props.getDataTransferItemsFromEvent || getFilesFromEvent;
	};

	handleDragEnter = async e => {
		e.preventDefault();
		e.stopPropagation();
		const dragged = await this.getDataTransferItemsFromEvent()(e);
		this.setState({ active: true, dragged });
	};

	handleDragOver = async e => {
		e.preventDefault();
		e.stopPropagation();
		clearTimeout(this._dragTimeoutId);
		const dragged = await this.getDataTransferItemsFromEvent()(e);
		this.setState({ active: true, dragged });
	};

	handleDragLeave = e => {
		e.preventDefault();
		e.stopPropagation();
		// prevents repeated toggling of `active` state when file is dragged over children of uploader
		// see: https://www.smashingmagazine.com/2018/01/drag-drop-file-uploader-vanilla-js/
		this._dragTimeoutId = setTimeout(
			() => this.setState({ active: false, dragged: [] }),
			150
		);
	};

	handleDrop = async e => {
		e.preventDefault();
		e.stopPropagation();
		this.setState({ active: false, dragged: [] });
		const files = await this.getFilesFromEvent()(e);
		this.handleFiles(files);
	};

	handleDropDisabled = e => {
		e.preventDefault();
		e.stopPropagation();
		this.setState({ active: false, dragged: [] });
	};

	handleChangeStatus = fileWithMeta => {
		if (!this.props.onChangeStatus) return;
		const { meta } =
			this.props.onChangeStatus(
				fileWithMeta,
				fileWithMeta.meta.status,
				this._files
			) || {};
		if (meta) {
			delete meta.status;
			fileWithMeta.meta = { ...fileWithMeta.meta, ...meta };
			this._forceUpdate();
		}
	};

	handleSubmit = files => {
		if (this.props.onSubmit) this.props.onSubmit(files, [...this._files]);
	};

	handleCancel = fileWithMeta => {
		if (fileWithMeta.meta.status !== "uploading") return;
		fileWithMeta.meta.status = "aborted";
		fileWithMeta.xhr.abort();
		this.handleChangeStatus(fileWithMeta);
		this._forceUpdate();
	};

	handleRemove = fileWithMeta => {
		const index = this._files.findIndex(f => f === fileWithMeta);
		if (index !== -1) {
			URL.revokeObjectURL(fileWithMeta.meta.previewUrl || "");
			fileWithMeta.meta.status = "removed";
			this.handleChangeStatus(fileWithMeta);
			this._files.splice(index, 1);
			this._forceUpdate();
		}
	};

	handleRestart = fileWithMeta => {
		if (!this.props.getUploadParams) return;

		if (fileWithMeta.meta.status === "ready")
			fileWithMeta.meta.status = "started";
		else fileWithMeta.meta.status = "restarted";
		this.handleChangeStatus(fileWithMeta);

		fileWithMeta.meta.status = "getting_upload_params";
		fileWithMeta.meta.percent = 0;
		this.handleChangeStatus(fileWithMeta);
		this._forceUpdate();
		this.uploadFile(fileWithMeta);
	};

	// expects an array of File objects
	handleFiles = files => {
		files.forEach((f, i) => this.handleFile(f, `${new Date().getTime()}-${i}`));
		const { current } = this._dropzone;
		if (current)
			setTimeout(
				() => current.scroll({ top: current.scrollHeight, behavior: "smooth" }),
				150
			);
	};

	handleFile = async (file, id) => {
		const { name, size, type, lastModified } = file;
		const {
			minSizeBytes,
			maxSizeBytes,
			maxFiles,
			accept,
			getUploadParams,
			autoUpload,
			validate
		} = this.props;

		const uploadedDate = new Date().toISOString();
		const lastModifiedDate =
			lastModified && new Date(lastModified).toISOString();
		const fileWithMeta = {
			file,
			meta: { name, size, type, lastModifiedDate, uploadedDate, percent: 0, id }
		};

		// firefox versions prior to 53 return a bogus mime type for file drag events,
		// so files with that mime type are always accepted
		if (file.type !== "application/x-moz-file" && !accepts(file, accept)) {
			fileWithMeta.meta.status = "rejected_file_type";
			this.handleChangeStatus(fileWithMeta);
			return;
		}
		if (this._files.length >= maxFiles) {
			fileWithMeta.meta.status = "rejected_max_files";
			this.handleChangeStatus(fileWithMeta);
			return;
		}

		fileWithMeta.cancel = () => this.handleCancel(fileWithMeta);
		fileWithMeta.remove = () => this.handleRemove(fileWithMeta);
		fileWithMeta.restart = () => this.handleRestart(fileWithMeta);

		fileWithMeta.meta.status = "preparing";
		this._files.push(fileWithMeta);
		this.handleChangeStatus(fileWithMeta);
		this._forceUpdate();

		if (size < minSizeBytes || size > maxSizeBytes) {
			fileWithMeta.meta.status = "error_file_size";
			this.handleChangeStatus(fileWithMeta);
			this._forceUpdate();
			return;
		}

		await this.generatePreview(fileWithMeta);

		if (validate) {
			const error = validate(fileWithMeta);
			if (error) {
				fileWithMeta.meta.status = "error_validation";
				fileWithMeta.meta.validationError = error; // usually a string, but doesn't have to be
				this.handleChangeStatus(fileWithMeta);
				this._forceUpdate();
				return;
			}
		}

		if (getUploadParams) {
			if (autoUpload) {
				this.uploadFile(fileWithMeta);
				fileWithMeta.meta.status = "getting_upload_params";
			} else {
				fileWithMeta.meta.status = "ready";
			}
		} else {
			fileWithMeta.meta.status = "done";
		}
		this.handleChangeStatus(fileWithMeta);
		this._forceUpdate();
	};

	generatePreview = async fileWithMeta => {
		const {
			meta: { type },
			file
		} = fileWithMeta;
		const isImage = type.startsWith("image/");
		const isAudio = type.startsWith("audio/");
		const isVideo = type.startsWith("video/");
		if (!isImage && !isAudio && !isVideo) return;

		const objectUrl = URL.createObjectURL(file);

		const fileCallbackToPromise = (fileObj, callback) => {
			return new Promise(resolve => {
				fileObj[callback] = resolve;
			});
		};

		try {
			if (isImage) {
				const img = new Image();
				img.src = objectUrl;
				fileWithMeta.meta.previewUrl = objectUrl;
				await fileCallbackToPromise(img, "onload");
				fileWithMeta.meta.width = img.width;
				fileWithMeta.meta.height = img.height;
			}

			if (isAudio) {
				const audio = new Audio();
				audio.src = objectUrl;
				await fileCallbackToPromise(audio, "onloadedmetadata");
				fileWithMeta.meta.duration = audio.duration;
			}

			if (isVideo) {
				const video = document.createElement("video");
				video.src = objectUrl;
				await fileCallbackToPromise(video, "onloadedmetadata");
				fileWithMeta.meta.duration = video.duration;
				fileWithMeta.meta.videoWidth = video.videoWidth;
				fileWithMeta.meta.videoHeight = video.videoHeight;
			}
			if (!isImage) URL.revokeObjectURL(objectUrl);
		} catch (e) {
			URL.revokeObjectURL(objectUrl);
		}
		this._forceUpdate();
	};

	uploadFile = async fileWithMeta => {
		const { getUploadParams } = this.props;
		let params;
		try {
			params = await getUploadParams(fileWithMeta);
		} catch (e) {
			console.error("Error Upload Params", e.stack);
		}
		const {
			url,
			method = "POST",
			body,
			fields = {},
			headers = {},
			meta: extraMeta = {}
		} = params || {};
		delete extraMeta.status;

		if (!url) {
			fileWithMeta.meta.status = "error_upload_params";
			this.handleChangeStatus(fileWithMeta);
			this._forceUpdate();
			return;
		}

		const xhr = new XMLHttpRequest();
		const formData = new FormData();
		xhr.open(method, url, true);

		for (const field of Object.keys(fields))
			formData.append(field, fields[field]);
		xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
		for (const header of Object.keys(headers))
			xhr.setRequestHeader(header, headers[header]);
		fileWithMeta.meta = { ...fileWithMeta.meta, ...extraMeta };

		// update progress (can be used to show progress indicator)
		xhr.upload.addEventListener("progress", e => {
			fileWithMeta.meta.percent = (e.loaded * 100.0) / e.total || 100;
			this._forceUpdate();
		});

		xhr.addEventListener("readystatechange", () => {
			// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState
			if (xhr.readyState !== 2 && xhr.readyState !== 4) return;

			if (xhr.status === 0 && fileWithMeta.meta.status !== "aborted") {
				fileWithMeta.meta.status = "exception_upload";
				this.handleChangeStatus(fileWithMeta);
				this._forceUpdate();
			}

			if (xhr.status > 0 && xhr.status < 400) {
				fileWithMeta.meta.percent = 100;
				if (xhr.readyState === 2) fileWithMeta.meta.status = "headers_received";
				if (xhr.readyState === 4) fileWithMeta.meta.status = "done";
				this.handleChangeStatus(fileWithMeta);
				this._forceUpdate();
			}

			if (xhr.status >= 400 && fileWithMeta.meta.status !== "error_upload") {
				fileWithMeta.meta.status = "error_upload";
				this.handleChangeStatus(fileWithMeta);
				this._forceUpdate();
			}
		});

		formData.append("file", fileWithMeta.file);
		if (this.props.timeout) xhr.timeout = this.props.timeout;
		xhr.send(body || formData);
		fileWithMeta.xhr = xhr;
		fileWithMeta.meta.status = "uploading";
		this.handleChangeStatus(fileWithMeta);
		this._forceUpdate();
	};

	render() {
		const {
			accept,
			multiple,
			maxFiles,
			minSizeBytes,
			maxSizeBytes,
			onSubmit,
			getUploadParams,
			disabled,
			canCancel,
			canRemove,
			canRestart,
			inputContent,
			inputWithFilesContent,
			submitButtonDisabled,
			submitButtonContent,
			classNames,
			styles,
			addClassNames,
			InputComponent,
			PreviewComponent,
			SubmitButtonComponent,
			LayoutComponent
		} = this.props;

		const { active, dragged } = this.state;

		const reject = dragged.some(
			file => file.type !== "application/x-moz-file" && !accepts(file, accept)
		);
		const extra = {
			active,
			reject,
			dragged,
			accept,
			multiple,
			minSizeBytes,
			maxSizeBytes,
			maxFiles
		};
		const files = [...this._files];
		const dropzoneDisabled = resolveValue(disabled, files, extra);

		const {
			classNames: {
				dropzone: dropzoneClassName,
				dropzoneActive: dropzoneActiveClassName,
				dropzoneReject: dropzoneRejectClassName,
				dropzoneDisabled: dropzoneDisabledClassName,
				input: inputClassName,
				inputLabel: inputLabelClassName,
				inputLabelWithFiles: inputLabelWithFilesClassName,
				preview: previewClassName,
				previewImage: previewImageClassName,
				submitButtonContainer: submitButtonContainerClassName,
				submitButton: submitButtonClassName
			},
			styles: {
				dropzone: dropzoneStyle,
				dropzoneActive: dropzoneActiveStyle,
				dropzoneReject: dropzoneRejectStyle,
				dropzoneDisabled: dropzoneDisabledStyle,
				input: inputStyle,
				inputLabel: inputLabelStyle,
				inputLabelWithFiles: inputLabelWithFilesStyle,
				preview: previewStyle,
				previewImage: previewImageStyle,
				submitButtonContainer: submitButtonContainerStyle,
				submitButton: submitButtonStyle
			}
		} = mergeStyles(classNames, styles, addClassNames, files, extra);

		const Input_ = InputComponent || Input;
		const Preview_ = PreviewComponent || Preview;
		const SubmitButton_ = SubmitButtonComponent || SubmitButton;
		const Layout_ = LayoutComponent || Layout;

		let previews = null;
		if (PreviewComponent !== null) {
			previews = files.map(f => {
				return (
					<Preview_
						className={previewClassName}
						imageClassName={previewImageClassName}
						style={previewStyle}
						imageStyle={previewImageStyle}
						key={f.meta.id}
						fileWithMeta={f}
						meta={{ ...f.meta }}
						isUpload={Boolean(getUploadParams)}
						canCancel={resolveValue(canCancel, files, extra)}
						canRemove={resolveValue(canRemove, files, extra)}
						canRestart={resolveValue(canRestart, files, extra)}
						files={files}
						extra={extra}
					/>
				);
			});
		}

		const input =
			InputComponent !== null ? (
				<Input_
					className={inputClassName}
					labelClassName={inputLabelClassName}
					labelWithFilesClassName={inputLabelWithFilesClassName}
					style={inputStyle}
					labelStyle={inputLabelStyle}
					labelWithFilesStyle={inputLabelWithFilesStyle}
					getFilesFromEvent={this.getFilesFromEvent()}
					accept={accept}
					multiple={multiple}
					disabled={dropzoneDisabled}
					content={resolveValue(inputContent, files, extra)}
					withFilesContent={resolveValue(inputWithFilesContent, files, extra)}
					onFiles={this.handleFiles} // see: https://stackoverflow.com/questions/39484895
					files={files}
					extra={extra}
				/>
			) : null;

		const submitButton =
			onSubmit && SubmitButtonComponent !== null ? (
				<SubmitButton_
					className={submitButtonContainerClassName}
					buttonClassName={submitButtonClassName}
					style={submitButtonContainerStyle}
					buttonStyle={submitButtonStyle}
					disabled={resolveValue(submitButtonDisabled, files, extra)}
					content={resolveValue(submitButtonContent, files, extra)}
					onSubmit={this.handleSubmit}
					files={files}
					extra={extra}
				/>
			) : null;

		let className = dropzoneClassName;
		let style = dropzoneStyle;

		if (dropzoneDisabled) {
			className = `${className} ${dropzoneDisabledClassName}`;
			style = { ...(style || {}), ...(dropzoneDisabledStyle || {}) };
		} else if (reject) {
			className = `${className} ${dropzoneRejectClassName}`;
			style = { ...(style || {}), ...(dropzoneRejectStyle || {}) };
		} else if (active) {
			className = `${className} ${dropzoneActiveClassName}`;
			style = { ...(style || {}), ...(dropzoneActiveStyle || {}) };
    }
    
    if (this.props.width){
      style = {...style, width: this.props.width};
    }

    if (this.props.height){
      style = {...style, height: this.props.height};
    }

		return (
			<Layout_
				input={input}
				previews={previews}
				submitButton={submitButton}
				dropzoneProps={{
					ref: this._dropzone,
					className,
					style,
					onDragEnter: this.handleDragEnter,
					onDragOver: this.handleDragOver,
					onDragLeave: this.handleDragLeave,
					onDrop: dropzoneDisabled ? this.handleDropDisabled : this.handleDrop
				}}
				files={files}
				extra={{
					...extra,
					onFiles: this.handleFiles,
					onCancelFile: this.handleCancel,
					onRemoveFile: this.handleRemove,
					onRestartFile: this.handleRestart
				}}
			/>
		);
	}
}

AnterosDropzone.propTypes = {
	onChangeStatus: PropTypes.func,
	getUploadParams: PropTypes.func,
	onSubmit: PropTypes.func,

	getFilesFromEvent: PropTypes.func,
	getDataTransferItemsFromEvent: PropTypes.func,

	accept: PropTypes.string,
	multiple: PropTypes.bool,
	minSizeBytes: PropTypes.number.isRequired,
	maxSizeBytes: PropTypes.number.isRequired,
	maxFiles: PropTypes.number.isRequired,

	validate: PropTypes.func,

	autoUpload: PropTypes.bool,
	timeout: PropTypes.number,

	initialFiles: PropTypes.arrayOf(PropTypes.any),

	/* component customization */
	disabled: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),

	canCancel: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
	canRemove: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
	canRestart: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),

	inputContent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
	inputWithFilesContent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),

	submitButtonDisabled: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
	submitButtonContent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),

	classNames: PropTypes.object.isRequired,
	styles: PropTypes.object.isRequired,
	addClassNames: PropTypes.object.isRequired,

	/* component injection */
	InputComponent: PropTypes.func,
	PreviewComponent: PropTypes.func,
	SubmitButtonComponent: PropTypes.func,
  LayoutComponent: PropTypes.func,
  
  width: PropTypes.string,
  height: PropTypes.string
};

AnterosDropzone.defaultProps = {
	accept: "*",
	multiple: true,
	minSizeBytes: 0,
	maxSizeBytes: Number.MAX_SAFE_INTEGER,
	maxFiles: Number.MAX_SAFE_INTEGER,
	autoUpload: true,
	disabled: false,
	canCancel: true,
	canRemove: true,
	canRestart: true,
	inputContent: "Arraste aqui os arquivos ou  Clique para procurar",
	inputWithFilesContent: "Adicionar arquivos",
	submitButtonDisabled: false,
	submitButtonContent: "Enviar",
	classNames: {},
  	styles: {},
  	width: "300px",
	height: "200px",
	textAlign: "center",  
	addClassNames: {}
};

export default AnterosDropzone;
export {
	Layout,
	Input,
	Preview,
	SubmitButton,
	formatBytes,
	formatDuration,
	accepts,
	defaultClassNames,
	getFilesFromEvent
};
