import logging

logger = logging.getLogger(__name__)

def format_phone_number(phone):
    """
    Formats a phone number to E.164 standard (+254XXXXXXXXX).
    Accepts: 07XXXXXXXX, 01XXXXXXXX, 2547XXXXXXXX, 2541XXXXXXXX, +2547XXXXXXXX, +2541XXXXXXXX
    Returns: +254XXXXXXXXX (e.g., +254713524066)
    Raises ValueError for invalid formats.
    """
    phone = ''.join(phone.split())  # Remove whitespace
    logger.debug(f"Raw phone number received: '{phone}'")

    # Handle pre-formatted E.164 numbers
    if phone.startswith("+254") and len(phone) == 13 and phone[1:].isdigit():
        prefix = phone[4]  # Check the digit after +254 (should be 7 or 1)
        if prefix in ("7", "1"):
            logger.debug(f"Valid pre-formatted number: {phone}")
            return phone
        else:
            raise ValueError(f"Invalid prefix after +254: {prefix}. Must be 7 or 1.")

    # Handle raw Kenyan numbers
    if phone.startswith("0") and len(phone) == 10 and phone.isdigit():
        prefix = phone[1]  # Check if it's 07 or 01
        if prefix in ("7", "1"):
            formatted = f"+254{phone[2:]}"
            logger.debug(f"Formatted {phone} to {formatted}")
            return formatted
        else:
            raise ValueError(f"Invalid prefix {prefix}. Must be 07 or 01 for Kenyan numbers.")

    # Handle 254-prefixed numbers without +
    if phone.startswith("254") and len(phone) == 12 and phone.isdigit():
        prefix = phone[3]  # Check if it's 2547 or 2541
        if prefix in ("7", "1"):
            formatted = f"+{phone}"
            logger.debug(f"Formatted {phone} to {formatted}")
            return formatted
        else:
            raise ValueError(f"Invalid prefix after 254: {prefix}. Must be 7 or 1.")

    raise ValueError("Invalid phone number format. Use 07XXXXXXXX, 01XXXXXXXX, 2547XXXXXXXX, 2541XXXXXXXX, +2547XXXXXXXX, or +2541XXXXXXXX.")