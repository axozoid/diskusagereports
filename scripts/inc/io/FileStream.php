<?php
/*
 * Copyright (c) 2013 André Mekkawi <license@diskusagereports.com>
 * Version: @@SourceVersion
 *
 * LICENSE
 *
 * This source file is subject to the MIT license in the file LICENSE.txt.
 * The license is also available at http://diskusagereports.com/license.html
 */

/**
 * Exception thrown by {@link FileStream}.
 */
class IOException extends Exception {

	/**
	 * @var FileStream
	 */
	protected $writer;

	/**
	 * Construct the exception.
	 * @param string     $message
	 * @param FileStream $writer
	 */
	public function __construct($message = "", FileStream $writer) {
		parent::__construct($message);
		$this->writer = $writer;
	}

	/**
	 * Get the stream for the exception.
	 * @return FileStream
	 */
	public function getWriter() {
		return $this->writer;
	}
}

/**
 * File reader and writer utility class.
 */
class FileStream {

	/**
	 * @var resource
	 */
	protected $handle;

	/**
	 * @var string
	 */
	protected $path;

	/**
	 * @var string
	 */
	protected $mode;

	/**
	 * @var boolean
	 */
	protected $isOpen;

	/**
	 * @param string $path
	 * @param string $mode
	 *
	 * @throws IOException
	 */
	public function __construct($path, $mode = 'r') {
		$this->path = $path;
		$this->mode = $mode;
		$this->handle = @fopen($path, $mode);
		if ($this->handle === false)
			throw new IOException("Failed to open file for '$mode': $path", $this);
		$this->isOpen = true;
	}

	/**
	 * @return resource
	 */
	public function getHandle() {
		return $this->handle;
	}

	/**
	 * @return string
	 */
	public function getMode() {
		return $this->mode;
	}

	/**
	 * @return string
	 */
	public function getPath() {
		return $this->path;
	}

	/**
	 * @return boolean
	 */
	public function isOpen() {
		return $this->isOpen;
	}

	/**
	 * Writes the contents of string to the file stream.
	 *
	 * @param string   $string The string that is to be written.
	 * @param int|null $length If the length argument is given, writing will stop after
	 *                         length bytes have been written or the end of string is reached,
	 *                         whichever comes first.
	 *
	 * @return int Number of bytes written.
	 * @throws IOException
	 * @see fwrite
	 */
	public function write($string, $length = null) {
		if ($length === null)
			$result = fwrite($this->handle, $string);
		else
			$result = fwrite($this->handle, $string, $length);

		if ($result === false)
			throw new IOException("Failed to write to file.", $this);

		return $result;
	}

	/**
	 * Gets line from file stream.
	 *
	 * @param int|null $length Reading ends when length - 1 bytes have been read, or a newline
	 *                         (which is included in the return value), or an EOF (whichever
	 *                         comes first). If no length is specified, it will keep reading
	 *                         from the stream until it reaches the end of the line.
	 *
	 * @return string Returns a string of up to length - 1 bytes read from the file pointed to by handle.
	 *                If there is no more data to read in the file pointer, then FALSE is returned.
	 *
	 * @throws IOException
	 * @see fgets
	 */
	public function gets($length = null) {
		$string = $length === null ? fgets($this->handle) : fgets($this->handle, $length);

		if ($string === false && !(@feof($this->handle)))
			throw new IOException("Failed to read line from file.", $this);

		return $string;
	}

	/**
	 * Flushes writes to disk.
	 * @throws IOException
	 * @see fflush
	 */
	public function flush() {
		if (fflush($this->handle) === false)
			throw new IOException("Failed to flush the stream.", $this);
	}

	/**
	 * @return bool Get if the end of file has been reached.
	 * @see feof
	 */
	public function eof() {
		return feof($this->handle);
	}

	/**
	 * Get the current position of the file pointer.
	 * @return int
	 * @throws IOException
	 * @see ftell
	 */
	public function tell() {
		if (($result = ftell($this->handle)) === false)
			throw new IOException("Failed to get the current position of the file stream.", $this);

		return $result;
	}

	/**
	 * Get information about the file.
	 * @return array
	 * @see fstat
	 */
	public function stat() {
		return @fstat($this->handle);
	}

	/**
	 * Rewind the file pointer to the beginning of the file.
	 * @throws IOException
	 * @see rewind
	 */
	public function rewind() {
		if (rewind($this->handle) === false)
			throw new IOException("Failed to rewind the file stream.", $this);
	}

	/**
	 * Move the file pointer to a specific position in the file.
	 * @param int $offset
	 * @param int $whence
	 * @throws IOException
	 * @see fseek
	 */
	public function seek($offset, $whence = SEEK_SET) {
		if (fseek($this->handle, $offset, $whence) !== 0)
			throw new IOException("Failed to seek the file stream.", $this);
	}

	/**
	 * Move the file pointer to the end of the file.
	 * @throws IOException
	 * @see fseek
	 */
	public function seekToEnd() {
		$this->seek(-1, SEEK_END);
	}

	/**
	 * Close the file.
	 *
	 * @param bool $ignoreError Whether or not to throw an IOException if the file fails to close.
	 *
	 * @throws IOException
	 */
	public function close($ignoreError = true) {
		$this->isOpen = false;
		if (fclose($this->handle) === false && !$ignoreError)
			throw new IOException("Failed to close file.", $this);
	}

	/**
	 * Close the file and unlink it.
	 *
	 * @throws IOException
	 * @see unlink
	 */
	public function unlink($ignoreError = false) {
		if ($this->isOpen)
			$this->close($ignoreError);

		if (unlink($this->path) === false && !$ignoreError)
			throw new IOException("Failed to unlink the file.", $this);
	}
}
