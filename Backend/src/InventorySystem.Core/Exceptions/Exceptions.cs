using System;

namespace InventorySystem.Core.Exceptions
{
    public class DomainException : Exception
    {
        public DomainException(string message) : base(message) { }
    }

    public class NotFoundException : Exception
    {
        public NotFoundException(string message) : base(message) { }
    }
}
